const controller = {};

// --- GESTIÓN DEL CATÁLOGO DE SERVICIOS ---

controller.listCatalog = (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.status(500).json({ message: "Error de conexión" });
        
        conn.query('SELECT id_servicio, nombre, descripcion, costo FROM servicios', (err, servicios) => {
            if (err) {
                console.error("Error SQL en listCatalog:", err);
                return res.status(500).json({ error: err.message });
            }
            res.json(servicios || []);
        });
    });
};

controller.saveService = (req, res) => {
    const data = req.body;

    req.getConnection((err, conn) => {
        if (err) return res.status(500).json({ message: "Error de conexión" });
        conn.query('INSERT INTO servicios SET ?', [data], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Servicio creado en el catálogo" });
        });
    });
};

// NUEVO: Editar datos del servicio
controller.updateService = (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, costo } = req.body;
    
    req.getConnection((err, conn) => {
        if (err) return res.status(500).json({ message: "Error de conexión" });
        conn.query('UPDATE servicios SET nombre = ?, descripcion = ?, costo = ? WHERE id_servicio = ?', 
        [nombre, descripcion, costo, id], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Servicio actualizado correctamente" });
        });
    });
};

// --- GESTIÓN DE PAGOS Y ESTADOS ---

controller.listPagos = (req, res) => {
    const query = `
        SELECT 
            p.id_pago, 
            p.monto, 
            p.estado, 
            p.fecha_pago,
            c.numero_casa, 
            s.nombre as nombre_servicio 
        FROM pagos p
        INNER JOIN casas c ON p.id_casa = c.id_casa
        INNER JOIN servicios s ON p.id_servicio = s.id_servicio
        ORDER BY p.id_pago DESC
    `;
    
    req.getConnection((err, conn) => {
        if (err) return res.status(500).json({ message: "Error de conexión" });
        conn.query(query, (err, pagos) => {
            if (err) {
                console.error("Error SQL en listPagos:", err);
                return res.status(500).json({ error: err.message });
            }
            res.json(pagos || []);
        });
    });
};

controller.savePago = (req, res) => {
    const data = req.body; 
    if (!data.fecha_pago) {
        data.fecha_pago = new Date().toISOString().slice(0, 10);
    }
    // Por defecto, un cobro nuevo nace como 'pendiente'
    if (!data.estado) data.estado = 'pendiente';

    req.getConnection((err, conn) => {
        if (err) return res.status(500).json({ message: "Error de conexión" });
        conn.query('INSERT INTO pagos SET ?', [data], (err, rows) => {
            if (err) {
                console.error("Error al insertar pago:", err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Pago registrado exitosamente" });
        });
    });
};

// NUEVO: Marcar pago como Pagado
controller.updatePagoStatus = (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    
    req.getConnection((err, conn) => {
        if (err) return res.status(500).json({ message: "Error de conexión" });
        conn.query('UPDATE pagos SET estado = ? WHERE id_pago = ?', [estado, id], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Estado del pago actualizado" });
        });
    });
};

module.exports = controller;