const controller = {};

controller.list = (req, res) => {
    req.getConnection((err, conn) => {
        if (err) {
            return res.status(500).json({ error: 'Error de conexión a la base de datos' });
        }

        const query = `
            SELECT 
                residentes.*,
                casas.numero_casa
            FROM residentes
            LEFT JOIN casas ON residentes.id_casa = casas.id_casa
            ORDER BY residentes.id_residente DESC
        `;

        conn.query(query, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Error al consultar residentes', details: err });
            }
            res.json(rows);
        });
    });
};

controller.save = (req, res) => {
    const data = req.body;

    if (!data.nombre || !data.apellido) {
        return res.status(400).json({ error: 'El nombre y apellido son obligatorios' });
    }

    // Normalizar id_casa vacío a null
    if (data.id_casa === '' || data.id_casa === undefined) {
        data.id_casa = null;
    }

    console.log('Guardando residente:', data);

    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error de conexión:', err);
            return res.status(500).json({ error: 'Error de conexión a la base de datos' });
        }

        // Solo validar la casa si se proporcionó un id_casa
        if (data.id_casa !== null) {
            const idCasa = parseInt(data.id_casa);
            if (isNaN(idCasa)) {
                return res.status(400).json({ error: 'El ID de la casa debe ser un número válido' });
            }
            data.id_casa = idCasa;

            conn.query('SELECT id_casa FROM casas WHERE id_casa = ?', [idCasa], (err, rows) => {
                if (err) {
                    console.error('Error al verificar casa:', err);
                    return res.status(500).json({ error: 'Error al verificar la casa' });
                }

                if (rows.length === 0) {
                    return res.status(400).json({ error: 'La casa seleccionada no existe' });
                }

                insertarResidente();
            });
        } else {
            insertarResidente();
        }

        function insertarResidente() {
            conn.query('INSERT INTO residentes SET ?', [data], (err, result) => {
                if (err) {
                    console.error('Error al insertar residente:', err);
                    
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ error: 'Ya existe un residente con estos datos' });
                    }
                    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                        return res.status(400).json({ error: 'La casa seleccionada no es válida' });
                    }
                    
                    return res.status(500).json({ 
                        error: 'Error al guardar residente', 
                        message: err.message 
                    });
                }
                
                console.log('Residente guardado con ID:', result.insertId);
                res.json({ message: 'Residente guardado correctamente', id: result.insertId });
            });
        }
    });
};

controller.update = (req, res) => {
    const { id_residente } = req.params;
    const data = req.body;

    if (!data.nombre || !data.apellido) {
        return res.status(400).json({ error: 'El nombre y apellido son obligatorios' });
    }

    // Normalizar id_casa vacío a null
    if (data.id_casa === '' || data.id_casa === undefined) {
        data.id_casa = null;
    }

    console.log('Actualizando residente:', id_residente, data);

    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error de conexión:', err);
            return res.status(500).json({ error: 'Error de conexión a la base de datos' });
        }

        // Solo validar la casa si se proporcionó un id_casa
        if (data.id_casa !== null) {
            const idCasa = parseInt(data.id_casa);
            if (isNaN(idCasa)) {
                return res.status(400).json({ error: 'El ID de la casa debe ser un número válido' });
            }
            data.id_casa = idCasa;

            conn.query('SELECT id_casa FROM casas WHERE id_casa = ?', [idCasa], (err, rows) => {
                if (err) {
                    console.error('Error al verificar casa:', err);
                    return res.status(500).json({ error: 'Error al verificar la casa' });
                }

                if (rows.length === 0) {
                    return res.status(400).json({ error: 'La casa seleccionada no existe' });
                }

                actualizarResidente();
            });
        } else {
            actualizarResidente();
        }

        function actualizarResidente() {
            conn.query('UPDATE residentes SET ? WHERE id_residente = ?', [data, id_residente], (err, result) => {
                if (err) {
                    console.error('Error al actualizar residente:', err);
                    return res.status(500).json({ 
                        error: 'Error al actualizar residente', 
                        message: err.message 
                    });
                }
                
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Residente no encontrado' });
                }
                
                console.log('Residente actualizado:', id_residente);
                res.json({ message: 'Residente actualizado correctamente' });
            });
        }
    });
};

controller.delete = (req, res) => {
    const { id_residente } = req.params;

    req.getConnection((err, conn) => {
        if (err) {
            return res.status(500).json({ error: 'Error de conexión a la base de datos' });
        }

        conn.query('DELETE FROM residentes WHERE id_residente = ?', [id_residente], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error al eliminar residente', details: err });
            }
            res.json({ message: 'Residente eliminado correctamente' });
        });
    });
};

module.exports = controller;
