const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');

// Endpoint Utama Gerbang (ESP32)
router.post('/tap', parkingController.handleTap);
router.get('/unknown-uid', parkingController.getUnknownUid); 

// Endpoint Manajemen Users
router.get('/users', parkingController.getAllUsers);
router.post('/users', parkingController.createUser);
router.get('/users/:id', parkingController.getUserDetail); // INI YANG KEMARIN BIKIN BLANK
router.put('/users/:id', parkingController.updateUser);    // INI BUAT EDIT USER
router.delete('/users/:id', parkingController.deleteUser);

// Endpoint Manajemen Logs
router.get('/logs', parkingController.getAllLogs);
router.put('/logs/:id', parkingController.updateLog);      // INI YANG BIKIN UPDATE LOG GAGAL
router.delete('/logs/:id', parkingController.deleteLog);
router.get('/logs/export', parkingController.exportPDF); // <--- TAMBAHIN BARIS INI
module.exports = router;