const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ msg: 'Token no enviado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token inválido' });
  }
}

function autorizarRoles(...rolesPermitidos) {
  return (req, res, next) => {
    const usuario = req.usuario;
    if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }
    next();
  };
}

module.exports = { verificarToken, autorizarRoles };