const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
app.use(cors());
app.use(express.json());

// Hubungkan semua jalur dari folder routes
app.use('/api/parking', apiRoutes);

const PORT = 5000;

// INI YANG DIRUBAH: Tambahin '0.0.0.0' biar server nerima tamu dari ESP32 & HP
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server Backend Enterprise KLP 14 jalan di port ${PORT} dan terbuka untuk semua perangkat!`);
});

