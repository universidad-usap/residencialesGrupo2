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

    conn.query(
      "SELECT id_usuario, nombre, usuario, rol FROM usuarios WHERE usuario = ? AND password = ?",
      [usuario, password],
      (err, users) => {
        if (err) {
          console.error("Error en la consulta:", err);
          return res.status(500).json(err);
        }

        if (users.length > 0) {
          console.log("Usuario encontrado:", users[0].nombre);
          res.json({
            auth: true,
            user: users[0],
          });
        } else {
          console.log("Credenciales no coinciden en la BD");
          res.status(401).json({
            auth: false,
            message: "Credenciales incorrectas",
          });
        }
      },
    );
  });
};

controller.save = (req, res) => {
  const { nombre, usuario, password, rol } = req.body;

  if (!nombre || !usuario || !password || !rol) {
    return res.status(400).json({
      message:
        "Todos los campos son obligatorios (nombre, usuario, contraseña y rol)",
    });
  }

  const rolesPermitidos = ["ADMIN", "GUARDIA"];
  if (!rolesPermitidos.includes(rol.toUpperCase())) {
    return res
      .status(400)
      .json({ message: "Rol no válido. Use ADMIN o GUARDIA" });
  }

  const nuevoUsuario = { nombre, usuario, password, rol: rol.toUpperCase() };

  console.log("Registrando nuevo usuario (limpio):", nuevoUsuario);

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json(err);

    conn.query("INSERT INTO usuarios SET ?", [nuevoUsuario], (err, result) => {
      if (err) {
        console.error("Error al insertar:", err);
        if (err.code === "ER_DUP_ENTRY") {
          return res
            .status(400)
            .json({ message: "El nombre de usuario ya existe" });
        }
        return res.status(500).json(err);
      }
      res.json({ message: "Usuario creado exitosamente" });
    });
  });
};

controller.list = (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).json(err);
    conn.query(
      "SELECT id_usuario, nombre, usuario, rol FROM usuarios",
      (err, usuarios) => {
        if (err) return res.status(500).json(err);
        res.json(usuarios);
      },
    );
  });
};

controller.delete = (req, res) => {
  const { id } = req.params;
  req.getConnection((err, conn) => {
    if (err) return res.status(500).json(err);
    conn.query(
      "DELETE FROM usuarios WHERE id_usuario = ?",
      [id],
      (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json({ message: "Usuario eliminado correctamente" });
      },
    );
  });
};

module.exports = controller;
