const controller = {};

// 1. Listar todas las casas con su área (Bloque)
controller.list = (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.status(500).json(err);
        const sql = `
            SELECT casas.*, areas.nombre as nombre_area 
            FROM casas 
            LEFT JOIN areas ON casas.id_area = areas.id_area`;
        
        conn.query(sql, (err, casas) => {
            if (err) return res.status(500).json(err);
            res.json(casas);
        });
    });
};

// 2. Guardar nueva propiedad
controller.save = (req, res) => {
    const { numero_casa, id_area, propietario, telefono, estado } = req.body;
    const nuevaCasa = { numero_casa, id_area, propietario, telefono, estado };

    req.getConnection((err, conn) => {
        if (err) return res.status(500).json(err);
        
        conn.query('INSERT INTO casas SET ?', [nuevaCasa], (err, rows) => {
            if (err) {
                console.error("Error MySQL:", err);
                return res.status(500).json(err);
            }
            res.json({ message: "Casa registrada exitosamente" });
        });
    });
};

// 3. Actualizar datos de una casa
controller.update = (req, res) => {
    const { id_casa } = req.params;
    const { numero_casa, id_area, propietario, telefono, estado } = req.body;
    const datosActualizados = { numero_casa, id_area, propietario, telefono, estado };

    req.getConnection((err, conn) => {
        if (err) return res.status(500).json(err);
        
        conn.query('UPDATE casas SET ? WHERE id_casa = ?', [datosActualizados, id_casa], (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Datos de casa actualizados" });
        });
    });
};

// 4. Eliminar una casa (Nuevo: para que coincida con tu api.ts)
controller.delete = (req, res) => {
    const { id_casa } = req.params;
    req.getConnection((err, conn) => {
        if (err) return res.status(500).json(err);
        conn.query('DELETE FROM casas WHERE id_casa = ?', [id_casa], (err, rows) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Casa eliminada correctamente" });
        });
    });
};

module.exports = controller;