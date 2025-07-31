const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  rut: { type: String, required: true, unique: true },
  correo: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
  nombre: String,
  rol: {
    type: String,
    enum: ['superadmin', 'profesor'],
    default: 'profesor'
  },
  permisos: {
    columnasEditable: [String]
  }
});

module.exports = mongoose.model('Admin', adminSchema);