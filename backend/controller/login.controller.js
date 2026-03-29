const controller = {};

// 1. Iniciar Sesión
controller.login = (req, res) => {
    const { usuario, password } = req.body;

    // LOG DE CONTROL: Para ver qué llega desde Angular
    console.log("Intento de login con:", { usuario, password });

    req.getConnection((err, conn) => {
        if (err) {
            console.error("Error de conexión:", err);
            return res.status(500).json(err);
        }

        conn.query('SELECT id_usuario, nombre, usuario FROM usuarios WHERE usuario = ? AND password = ?', 
        [usuario, password], (err, users) => {
            if (err) {
                console.error("Error en la consulta:", err);
                return res.status(500).json(err);
            }

            if (users.length > 0) {
                console.log("Usuario encontrado:", users[0].nombre);
                res.json({ 
                    auth: true, 
                    user: users[0] 
                });
            } else {
                console.log("Credenciales no coinciden en la BD");
                res.status(401).json({ 
                    auth: false, 
                    message: "Credenciales incorrectas" 
                });
            }
        });
    });
};

// 2. Crear Nuevo Usuario
controller.save = (req, res) => {
    const data = req.body;
    console.log("Registrando nuevo usuario:", data);

    req.getConnection((err, conn) => {
        if (err) return res.status(500).json(err);

        conn.query('INSERT INTO usuarios SET ?', [data], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: "El nombre de usuario ya existe" });
                }
                return res.status(500).json(err);
            }
            res.json({ message: "Usuario creado exitosamente" });
        });
    });
};

// 3. Listar Usuarios
controller.list = (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.status(500).json(err);
        conn.query('SELECT id_usuario, nombre, usuario FROM usuarios', (err, usuarios) => {
            if (err) return res.status(500).json(err);
            res.json(usuarios);
        });
    });
};

module.exports = controller;