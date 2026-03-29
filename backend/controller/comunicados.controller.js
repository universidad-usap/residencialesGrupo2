const controller = {};

controller.list = (req, res) => {
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM comunicados ORDER BY fecha_publicacion DESC', (err, comunicados) => {
            if (err) return res.json(err);
            res.json(comunicados);
        });
    });
};

controller.save = (req, res) => {
    const data = req.body;
    // La fecha se pone automática en la BD por el DEFAULT CURRENT_TIMESTAMP
    req.getConnection((err, conn) => {
        conn.query('INSERT INTO comunicados SET ?', [data], (err, rows) => {
            if (err) return res.json(err);
            res.json({ message: "Comunicado publicado" });
        });
    });
};

module.exports = controller;