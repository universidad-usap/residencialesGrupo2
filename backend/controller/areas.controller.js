const controller = {};

// 1. LISTAR: Traemos TODOS para poder ver quién está activo y quién no
controller.list = (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.status(500).json(err);
        
        // Quitamos el WHERE para que la tabla muestre los badges "Inactivo"
        conn.query('SELECT * FROM areas', (err, areas) => {
            if (err) return res.status(500).json(err);
            res.json(areas);
        });
    });
};

// 2. GUARDAR: Insertamos con estado 1 por defecto
controller.save = (req, res) => {
    const data = req.body; 
    const areaNueva = { ...data, estado: 1 };

    req.getConnection((err, conn) => {
        if (err) return res.status(500).json(err);
        
        conn.query('INSERT INTO areas SET ?', [areaNueva], (err, area) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Área creada con éxito" });
        });
    });
};

// 3. ACTUALIZAR: Este sirve para editar textos Y para reactivar (estado: 1)
controller.update = (req, res) => {
    const { id_area } = req.params;
    const newData = req.body; 

    req.getConnection((err, conn) => {
        if (err) return res.status(500).json(err);
        
        conn.query('UPDATE areas SET ? WHERE id_area = ?', [newData, id_area], (err, rows) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Registro actualizado" });
        });
    });
};

// 4. ELIMINAR (Lógica): AQUÍ ESTABA EL ERROR. 
// Ahora sí actualiza el estado a 0.
controller.delete = (req, res) => {
    const { id_area } = req.params;
    
    req.getConnection((err, conn) => {
        if (err) return res.status(500).json(err);
        
        // Cambiamos el estado a 0 en lugar de hacer un SELECT
        conn.query('UPDATE areas SET estado = 0 WHERE id_area = ?', [id_area], (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Área desactivada correctamente" });
        });
    });
};

module.exports = controller;