const controller = {};

// Listar todos los comunicados ordenados por los más recientes
controller.list = (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.status(500).json(err);
        conn.query('SELECT * FROM comunicados ORDER BY fecha_publicacion DESC', (err, comunicados) => {
            if (err) return res.json(err);
            res.json(comunicados);
        });
    });
};

// Guardar un nuevo comunicado
controller.save = (req, res) => {
    const data = req.body;
    // La fecha se asigna automáticamente en la base de datos
    req.getConnection((err, conn) => {
        if (err) return res.status(500).json(err);
        conn.query('INSERT INTO comunicados SET ?', [data], (err, rows) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Comunicado publicado con éxito" });
        });
    });
};

// Nuevo: Eliminar un comunicado por su ID
controller.delete = (req, res) => {
    const { id } = req.params;
    req.getConnection((err, conn) => {
        if (err) return res.status(500).json(err);
        conn.query('DELETE FROM comunicados WHERE id_comunicado = ?', [id], (err, rows) => {
            if (err) return res.json(err);
            res.json({ message: "Comunicado eliminado" });
        });
    });
};

module.exports = controller;