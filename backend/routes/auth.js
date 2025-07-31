const express = require('express');
const router = express.Router();

const Alumno = require('../models/Alumno');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registro de alumno
router.post('/registro', async (req, res) => {
  const {
    correo,
    contrasena,
    tipo_documento,
    numero_documento,
    nombre,
    apellido,
    semestre,
    jornada,
  } = req.body;

  try {
    const rut = tipo_documento === 'RUT' ? numero_documento : null;

    if (!correo) {
      return res.status(400).json({ msg: 'El campo correo es obligatorio' });
    }

    const existeCorreo = await Alumno.findOne({ correo });
    if (existeCorreo) return res.status(400).json({ msg: 'El correo ya está registrado' });

    if (rut) {
      const existeRut = await Alumno.findOne({ rut });
      if (existeRut) return res.status(400).json({ msg: 'El alumno ya existe con ese RUT' });
    }

    const hash = await bcrypt.hash(contrasena, 10);

    const nuevo = new Alumno({
      rut,
      correo,
      contrasena: hash,
      tipo_documento,
      numero_documento,
      nombre,
      apellido,
      semestre,
      jornada,
      habilitado: true,
      aviso_suspension: false,
      rehabilitar_acceso: false,
      conteo_ingresos: 0,
      color_riesgo: 'verde'
    });

    await nuevo.save();
    res.json({ msg: 'Alumno creado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al registrar alumno' });
  }
});

// Login de alumno
router.post('/login', async (req, res) => {
  const rut = req.body.rut?.trim(); // aseguramos que no tenga espacios
  const contrasena = req.body.contrasena;

  try {
    // Buscar por rut (si fue guardado como campo), o por numero_documento y tipo_documento RUT
    const alumno = await Alumno.findOne({
      $or: [
        { rut: rut },
        { numero_documento: rut, tipo_documento: 'RUT' }
      ]
    });

    if (!alumno) return res.status(400).json({ msg: 'Rut no encontrado' });

    const esValida = await bcrypt.compare(contrasena, alumno.contrasena);
    if (!esValida) return res.status(400).json({ msg: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: alumno._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({ token, alumno });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
});

// Obtener todos los alumnos
router.get('/alumnos', async (req, res) => {
  try {
    const alumnos = await Alumno.find({}, '-contrasena -__v'); // excluye la contraseña y __v
    res.json(alumnos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener alumnos' });
  }
});

module.exports = router;