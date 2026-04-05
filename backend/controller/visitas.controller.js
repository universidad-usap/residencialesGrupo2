const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

const controller = {};

// Listar todas las visitas con su QR
controller.list = (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.status(500).json({ error: 'Error de conexión a la base de datos' });

        const query = `
            SELECT 
                visitas.*,
                tipos_visita.nombre AS tipo_nombre,
                codigos_qr.id_qr,
                codigos_qr.codigo_token,
                codigos_qr.estado AS estado_qr
            FROM visitas
            LEFT JOIN tipos_visita ON visitas.id_tipo = tipos_visita.id_tipo
            LEFT JOIN codigos_qr ON visitas.id_visita = codigos_qr.id_visita
            ORDER BY visitas.id_visita DESC
        `;

        conn.query(query, (err, rows) => {
            if (err) return res.status(500).json({ error: 'Error al consultar visitas', details: err });
            res.json(rows);
        });
    });
};

// Registrar visita y generar QR
controller.save = (req, res) => {
    const { nombre, identidad, telefono, placa_vehiculo, id_tipo } = req.body;

    if (!nombre || !identidad) {
        return res.status(400).json({ error: 'El nombre e identidad son obligatorios' });
    }

    req.getConnection((err, conn) => {
        if (err) return res.status(500).json({ error: 'Error de conexión a la base de datos' });

        const visitaData = { nombre, identidad, telefono, placa_vehiculo, id_tipo: id_tipo || null };

        conn.query('INSERT INTO visitas SET ?', [visitaData], (err, result) => {
            if (err) return res.status(500).json({ error: 'Error al registrar visita', message: err.message });

            const id_visita = result.insertId;
            const codigo_token = uuidv4();

            conn.query(
                'INSERT INTO codigos_qr (id_visita, codigo_token, estado) VALUES (?, ?, ?)',
                [id_visita, codigo_token, 'activo'],
                (err) => {
                    if (err) return res.status(500).json({ error: 'Error al generar código QR', message: err.message });

                    // Generar imagen QR como data URL
                    QRCode.toDataURL(codigo_token, { width: 300, margin: 2 }, (err, qrDataUrl) => {
                        if (err) return res.status(500).json({ error: 'Error al generar imagen QR' });

                        res.json({
                            message: 'Visita registrada y QR generado correctamente',
                            id_visita,
                            codigo_token,
                            qr_imagen: qrDataUrl
                        });
                    });
                }
            );
        });
    });
};

// Eliminar visita (y su QR en cascada si aplica)
controller.delete = (req, res) => {
    const { id_visita } = req.params;

    req.getConnection((err, conn) => {
        if (err) return res.status(500).json({ error: 'Error de conexión a la base de datos' });

        conn.query('DELETE FROM codigos_qr WHERE id_visita = ?', [id_visita], (err) => {
            if (err) return res.status(500).json({ error: 'Error al eliminar QR asociado' });

            conn.query('DELETE FROM visitas WHERE id_visita = ?', [id_visita], (err) => {
                if (err) return res.status(500).json({ error: 'Error al eliminar visita' });
                res.json({ message: 'Visita eliminada correctamente' });
            });
        });
    });
};

// Obtener tipos de visita para el select del formulario
controller.listTipos = (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.status(500).json({ error: 'Error de conexión a la base de datos' });

        conn.query('SELECT * FROM tipos_visita ORDER BY nombre', (err, rows) => {
            if (err) return res.status(500).json({ error: 'Error al consultar tipos de visita' });
            res.json(rows);
        });
    });
};

// Regenerar QR para una visita existente
controller.regenerarQR = (req, res) => {
    const { id_visita } = req.params;

    req.getConnection((err, conn) => {
        if (err) return res.status(500).json({ error: 'Error de conexión a la base de datos' });

        const nuevo_token = uuidv4();

        conn.query(
            'UPDATE codigos_qr SET codigo_token = ?, estado = ? WHERE id_visita = ?',
            [nuevo_token, 'activo', id_visita],
            (err, result) => {
                if (err) return res.status(500).json({ error: 'Error al regenerar QR' });
                if (result.affectedRows === 0) return res.status(404).json({ error: 'No se encontró QR para esta visita' });

                QRCode.toDataURL(nuevo_token, { width: 300, margin: 2 }, (err, qrDataUrl) => {
                    if (err) return res.status(500).json({ error: 'Error al generar imagen QR' });

                    res.json({
                        message: 'QR regenerado correctamente',
                        codigo_token: nuevo_token,
                        qr_imagen: qrDataUrl
                    });
                });
            }
        );
    });
};

module.exports = controller;
