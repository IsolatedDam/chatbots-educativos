const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 🔑 Login de superadmin o profesor
router.post('/login', async (req, res) => {
  const { rut, contrasena } = req.body;

  try {
    const admin = await Admin.findOne({
      $or: [
        { rut: rut },
        { correo: rut }
      ]
    });

    if (!admin) {
      return res.status(400).json({ msg: 'Usuario no encontrado' });
    }

    const esValida = await bcrypt.compare(contrasena, admin.contrasena);
    if (!esValida) {
      return res.status(400).json({ msg: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: admin._id, rol: admin.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
});

module.exports = router;