const controller = {};

// 1. Iniciar Sesión
controller.login = (req, res) => {
    const { usuario, password } = req.body;

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

// 2. Crear Nuevo Usuario (CORREGIDO PARA EVITAR ER_BAD_FIELD_ERROR)
controller.save = (req, res) => {
    // Extraemos solo los campos que existen en la tabla de MySQL
    // Ignoramos 'adminCode' ya que MySQL no tiene esa columna
    const { nombre, usuario, password } = req.body;
    
    // Validación de campos requeridos
    if (!nombre || !usuario || !password) {
        console.log("Registro rechazado - Campos faltantes:", { nombre: !!nombre, usuario: !!usuario, password: !!password });
        return res.status(400).json({ 
            message: "Todos los campos son obligatorios (nombre, usuario y contraseña)" 
        });
    }
    
    // Creamos un objeto limpio para la inserción
    const nuevoUsuario = { nombre, usuario, password };

    console.log("Registrando nuevo usuario (limpio):", nuevoUsuario);

    req.getConnection((err, conn) => {
        if (err) return res.status(500).json(err);

        // Usamos el objeto filtrado 'nuevoUsuario' en lugar de 'req.body'
        conn.query('INSERT INTO usuarios SET ?', [nuevoUsuario], (err, result) => {
            if (err) {
                console.error("Error al insertar:", err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: "El nombre de usuario ya existe" });
                }
                // Esto capturará cualquier otro error de campo mal escrito
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