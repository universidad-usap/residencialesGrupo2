const controller = {};

controller.list = (req, res) => {
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM servicios', (err, servicios) => {
            if (err) return res.json(err);
            res.json(servicios);
        });
    });
};

controller.save = (req, res) => {
    const data = req.body;
    req.getConnection((err, conn) => {
        conn.query('INSERT INTO servicios SET ?', [data], (err, rows) => {
            if (err) return res.json(err);
            res.json({ message: "Servicio creado" });
        });
    });
};

module.exports = controller;