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

    req.getConnection((err, conn) => {
        if (err) {
            return res.status(500).json({ error: 'Error de conexión a la base de datos' });
        }

        conn.query('INSERT INTO residentes SET ?', [data], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error al guardar residente', details: err });
            }
            res.json({ message: 'Residente guardado correctamente', id: result.insertId });
        });
    });
};

controller.update = (req, res) => {
    const { id_residente } = req.params;
    const data = req.body;

    req.getConnection((err, conn) => {
        if (err) {
            return res.status(500).json({ error: 'Error de conexión a la base de datos' });
        }

        conn.query('UPDATE residentes SET ? WHERE id_residente = ?', [data, id_residente], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar residente', details: err });
            }
            res.json({ message: 'Residente actualizado correctamente' });
        });
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
