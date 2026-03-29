const controller = {};

controller.list = (req, res) => {
    req.getConnection((err, conn) => {
        // Traemos los datos de la casa + el nombre del área a la que pertenece
        const sql = `
            SELECT casas.*, areas.nombre as nombre_area 
            FROM casas 
            LEFT JOIN areas ON casas.id_area = areas.id_area`;
        
        conn.query(sql, (err, casas) => {
            if (err) return res.json(err);
            res.json(casas);
        });
    });
};

controller.save = (req, res) => {
    const data = req.body;
    req.getConnection((err, conn) => {
        conn.query('INSERT INTO casas SET ?', [data], (err, rows) => {
            if (err) return res.json(err);
            res.json({ message: "Casa registrada" });
        });
    });
};

controller.update = (req, res) => {
    const { id_casa } = req.params;
    const data = req.body;
    req.getConnection((err, conn) => {
        conn.query('UPDATE casas SET ? WHERE id_casa = ?', [data, id_casa], (err, rows) => {
            if (err) return res.json(err);
            res.json({ message: "Datos de casa actualizados" });
        });
    });
};

module.exports = controller;