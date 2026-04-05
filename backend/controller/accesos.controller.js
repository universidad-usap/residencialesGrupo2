const controller = {};

// Validar un token QR y registrar acceso
controller.validar = (req, res) => {
    const { codigo_token, guardia_id } = req.body;

    if (!codigo_token) {
        return res.status(400).json({ error: 'Se requiere el código QR' });
    }

    req.getConnection((err, conn) => {
        if (err) return res.status(500).json({ error: 'Error de conexión a la base de datos' });

        // Buscar el QR y su visita asociada
        const query = `
            SELECT 
                codigos_qr.*,
                visitas.nombre,
                visitas.identidad,
                visitas.telefono,
                visitas.placa_vehiculo,
                tipos_visita.nombre AS tipo_nombre
            FROM codigos_qr
            JOIN visitas ON codigos_qr.id_visita = visitas.id_visita
            LEFT JOIN tipos_visita ON visitas.id_tipo = tipos_visita.id_tipo
            WHERE codigos_qr.codigo_token = ?
        `;

        conn.query(query, [codigo_token], (err, rows) => {
            if (err) return res.status(500).json({ error: 'Error al validar el código QR' });

            if (rows.length === 0) {
                return res.status(404).json({
                    valido: false,
                    error: 'Código QR no reconocido'
                });
            }

            const qr = rows[0];

            if (qr.estado === 'expirado') {
                return res.status(200).json({
                    valido: false,
                    estado: 'expirado',
                    error: 'Este código QR ha expirado'
                });
            }

            if (qr.estado === 'usado') {
                return res.status(200).json({
                    valido: false,
                    estado: 'usado',
                    error: 'Este código QR ya fue utilizado',
                    visita: {
                        nombre: qr.nombre,
                        identidad: qr.identidad,
                        tipo: qr.tipo_nombre
                    }
                });
            }

            // QR activo: registrar acceso y marcar como usado
            const ahora = new Date();
            const accesoData = {
                id_qr: qr.id_qr,
                fecha_entrada: ahora,
                guardia_registro: guardia_id || null
            };

            conn.query('INSERT INTO accesos SET ?', [accesoData], (err) => {
                if (err) return res.status(500).json({ error: 'Error al registrar acceso' });

                conn.query(
                    "UPDATE codigos_qr SET estado = 'usado' WHERE id_qr = ?",
                    [qr.id_qr],
                    (err) => {
                        if (err) return res.status(500).json({ error: 'Error al actualizar estado del QR' });

                        res.json({
                            valido: true,
                            estado: 'activo',
                            message: 'Acceso autorizado',
                            visita: {
                                nombre: qr.nombre,
                                identidad: qr.identidad,
                                telefono: qr.telefono,
                                placa_vehiculo: qr.placa_vehiculo,
                                tipo: qr.tipo_nombre
                            }
                        });
                    }
                );
            });
        });
    });
};

// Listar todos los accesos registrados
controller.list = (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.status(500).json({ error: 'Error de conexión a la base de datos' });

        const query = `
            SELECT 
                accesos.id_acceso,
                accesos.fecha_entrada,
                accesos.fecha_salida,
                visitas.nombre AS visitante,
                visitas.identidad,
                visitas.placa_vehiculo,
                tipos_visita.nombre AS tipo_visita,
                usuarios.nombre AS guardia
            FROM accesos
            JOIN codigos_qr ON accesos.id_qr = codigos_qr.id_qr
            JOIN visitas ON codigos_qr.id_visita = visitas.id_visita
            LEFT JOIN tipos_visita ON visitas.id_tipo = tipos_visita.id_tipo
            LEFT JOIN usuarios ON accesos.guardia_registro = usuarios.id_usuario
            ORDER BY accesos.fecha_entrada DESC
        `;

        conn.query(query, (err, rows) => {
            if (err) return res.status(500).json({ error: 'Error al consultar accesos', details: err });
            res.json(rows);
        });
    });
};

module.exports = controller;
