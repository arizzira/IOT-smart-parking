const pool = require('../config/db');
const kirimNotifikasiTelegram = require('../utils/telegram');

let lastUnknownUid = null; 

// ================= 1. LOGIKA GERBANG (TAP) =================
// ================= 1. LOGIKA GERBANG (TAP) DENGAN CCTV =================
exports.handleTap = async (req, res) => {
  console.log("\n==================================");
  console.log("CCTV [1]: REQUEST MASUK DARI ESP32!");
  console.log("CCTV [2]: Data dari ESP32 ->", req.body);

  const { uid } = req.body; 
  const waktuSekarang = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  try {
    console.log("CCTV [3]: Mulai nyari UID di Database...");
    const userCheck = await pool.query('SELECT id, name FROM users WHERE uid = $1 AND is_active = TRUE', [uid]);
    console.log("CCTV [4]: Berhasil ngecek Database! User ketemu:", userCheck.rows.length);
    
    // PENYUSUP
    if (userCheck.rows.length === 0) {
      console.log("CCTV [5]: Ini Penyusup! Mengirim notif Telegram...");
      lastUnknownUid = uid;
      kirimNotifikasiTelegram(`🚨 *KARTU TIDAK DIKENAL (PENYUSUP)!*\nUID: \`${uid}\`\nWaktu: ${waktuSekarang}\nSegera cek gerbang atau daftarkan di dashboard.`);
      
      console.log("CCTV [6]: Mengirim balasan DITOLAK ke ESP32...");
      return res.status(404).json({ success: false, message: 'Kartu Ilegal', name: 'Penyusup' });
    }

    const userId = userCheck.rows[0].id;
    const userName = userCheck.rows[0].name;
    
    console.log("CCTV [7]: Ngecek apakah user ini lagi di dalem parkiran...");
    const logCheck = await pool.query('SELECT id, time_in FROM parking_logs WHERE user_id = $1 AND time_out IS NULL', [userId]);

    console.log("CCTV [8]: Ngitung jumlah mobil di dalem sekarang...");
    const slotCheck = await pool.query('SELECT COUNT(*) FROM parking_logs WHERE time_out IS NULL');
    const mobilDiDalam = parseInt(slotCheck.rows[0].count);
    console.log("CCTV [9]: Total mobil di dalem = ", mobilDiDalam);

    // SKENARIO: MASUK (CHECK-IN)
    if (logCheck.rows.length === 0) {
      console.log("CCTV [10]: Skenario CHECK-IN dieksekusi!");
      
      if (mobilDiDalam >= 1) {
        console.log("CCTV [11]: Parkir Penuh! Nolak ESP32...");
        kirimNotifikasiTelegram(`⚠️ *PARKIR PENUH!*\nUser: *${userName}* mencoba masuk, tapi slot sudah habis diisi kendaraan lain.`);
        return res.json({ success: false, message: 'Parkir Penuh!', name: userName });
      }

      console.log("CCTV [12]: Nyimpen log masuk ke Database...");
      await pool.query('INSERT INTO parking_logs (user_id, uid_snapshot, name_snapshot) VALUES ($1, $2, $3)', [userId, uid, userName]);
      
      console.log("CCTV [13]: Ngirim Telegram Check-in & Balas ke ESP32...");
      kirimNotifikasiTelegram(`🚗 *CHECK-IN BERHASIL*\nNama: *${userName}*\nUID: \`${uid}\`\nWaktu Masuk: ${waktuSekarang}\nStatus: Sedang di dalam area parkir.`);
      return res.json({ success: true, status: 'MASUK', name: userName, message: 'Selamat Datang' });
      
    } else {
      // SKENARIO: KELUAR (CHECK-OUT)
      console.log("CCTV [10]: Skenario CHECK-OUT dieksekusi!");
      const logId = logCheck.rows[0].id;
      const timeInDate = new Date(logCheck.rows[0].time_in).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      
      console.log("CCTV [11]: Update jam keluar di Database...");
      await pool.query(
        `UPDATE parking_logs SET time_out = CURRENT_TIMESTAMP, duration_seconds = FLOOR(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - time_in))) WHERE id = $1`, [logId]
      );

      console.log("CCTV [12]: Ngambil data durasi parkir dari Database...");
      const resultData = await pool.query('SELECT duration_seconds FROM parking_logs WHERE id = $1', [logId]);
      const durasi = resultData.rows[0].duration_seconds;

      console.log("CCTV [13]: Ngirim Telegram Check-out & Balas ke ESP32...");
      kirimNotifikasiTelegram(`🛫 *CHECK-OUT BERHASIL*\nNama: *${userName}*\nUID: \`${uid}\`\n\n🕒 Masuk: ${timeInDate}\n🕛 Keluar: ${waktuSekarang}\n⏱️ *Durasi Total: ${durasi} detik*\n\nTerima kasih telah menggunakan Smart Parking!`);
      
      return res.json({ success: true, status: 'KELUAR', name: userName, message: `${durasi} Detik` });
    }
  } catch (err) { 
    console.log("CCTV [ERROR]: ADA CRASH DI BACKEND!");
    console.error(err.message);
    res.status(500).send('Error'); 
  }
};

// Endpoint nangkep kartu baru
exports.getUnknownUid = (req, res) => res.json({ uid: lastUnknownUid });

// ================= 2. CRUD USER =================
exports.getAllUsers = async (req, res) => {
  const result = await pool.query('SELECT * FROM users WHERE is_active = TRUE ORDER BY name ASC');
  res.json(result.rows);
};

// INI BUAT HALAMAN DETAIL USER BIAR GAK BLANK
exports.getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const logs = await pool.query('SELECT * FROM parking_logs WHERE user_id = $1 ORDER BY time_in DESC', [id]);
    const totalWaktu = await pool.query('SELECT SUM(duration_seconds) as total FROM parking_logs WHERE user_id = $1', [id]);
    
    if (user.rows.length === 0) return res.status(404).json({ error: 'User tidak ditemukan' });

    res.json({
      user: user.rows[0],
      logs: logs.rows,
      totalWaktuDetik: totalWaktu.rows[0].total || 0
    });
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.createUser = async (req, res) => {
  const { uid, name } = req.body;
  await pool.query('INSERT INTO users (uid, name) VALUES ($1, $2)', [uid, name]);
  lastUnknownUid = null;
  res.json({ message: 'User dibuat' });
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, uid } = req.body;
  await pool.query('UPDATE users SET name = $1, uid = $2 WHERE id = $3', [name, uid, id]);
  res.json({ message: 'User diupdate' });
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  await pool.query('UPDATE users SET is_active = FALSE WHERE id = $1', [id]);
  res.json({ message: 'User dihapus, history aman' });
};

// ================= 3. CRUD LOGS =================
exports.getAllLogs = async (req, res) => {
  const result = await pool.query('SELECT * FROM parking_logs ORDER BY time_in DESC');
  res.json(result.rows);
};

// INI BUAT FUNGSI EDIT LOG BIAR JALAN
exports.updateLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { time_out } = req.body; 
    await pool.query(
      `UPDATE parking_logs SET time_out = $1, duration_seconds = FLOOR(EXTRACT(EPOCH FROM ($1::timestamp - time_in))) WHERE id = $2`, 
      [time_out, id]
    );
    res.json({ message: 'Log berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal update log' });
  }
};

exports.deleteLog = async (req, res) => {
  await pool.query('DELETE FROM parking_logs WHERE id = $1', [req.params.id]);
  res.json({ message: 'Log dihapus' });
};


exports.exportPDF = async (req, res) => {
  try {
    const PDFDocument = require('pdfkit-table');
    const FormData = require('form-data');
    const axios = require('axios');

    // Data rahasia bot lu (Udah disiapin)
    const TELEGRAM_BOT_TOKEN = '8774338524:AAEN6Dy7BwQPZaPztdDB-rSlwXzBIpnSN4Q';
    const TELEGRAM_CHAT_ID = '1194776569';

    // 1. Ambil semua data riwayat dari database
    const result = await pool.query('SELECT * FROM parking_logs ORDER BY time_in DESC');
    const logs = result.rows;

    // FUNGSI ADAPTIF DI SISI BACKEND (Biar PDF ga polos angka detik)
    const formatWaktuAdaptifBackend = (totalDetik) => {
      if (totalDetik === null || totalDetik === undefined) return '-';
      const d = Math.floor(totalDetik / 86400);
      const h = Math.floor((totalDetik % 86400) / 3600);
      const m = Math.floor((totalDetik % 3600) / 60);
      const s = totalDetik % 60;

      let hasil = [];
      if (d > 0) hasil.push(`${d} hari`);
      if (h > 0) hasil.push(`${h}j`);
      if (m > 0) hasil.push(`${m}m`);
      if (s > 0 || hasil.length === 0) hasil.push(`${s}s`);

      return hasil.join(' ');
    };

    // 2. Siapkan kanvas PDF ukuran A4
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    let buffers = [];

    // 3. Tangkap data PDF-nya jadi Buffer (File Memory)
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      let pdfData = Buffer.concat(buffers);

      // --- KIRIM FILE KE TELEGRAM SECARA BACKGROUND ---
      try {
        const form = new FormData();
        form.append('chat_id', TELEGRAM_CHAT_ID);
        form.append('document', pdfData, 'Laporan_Parkir_Kelompok14.pdf');
        form.append('caption', '📊 *Laporan Riwayat Parkir Lengkap*\n\nBerikut adalah file PDF yang baru saja digenerate oleh Admin dari Web Dashboard.', { contentType: 'text/plain' });

        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, form, {
          headers: form.getHeaders(),
          params: { parse_mode: 'Markdown' }
        });
        console.log("✅ Laporan PDF sukses meluncur ke Telegram!");
      } catch (err) {
        console.error("❌ Gagal kirim PDF ke Telegram:", err.message);
      }

      // --- KASIH KE BROWSER BUAT DIDOWNLOAD (Otomatis) ---
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=Laporan_Parkir_Kelompok14.pdf');
      res.send(pdfData);
    });

    // 4. Gambar Judul & Isi Tabel di dalam PDF
    doc.fontSize(16).text('LAPORAN RIWAYAT SMART PARKING (KLP 14)', { align: 'center' });
    doc.fontSize(9).text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, { align: 'center' });
    doc.moveDown(2);

    // Judul kolom dirubah dari "Durasi (Dtk)" jadi "Durasi" aja biar rapi
    const table = {
      headers: ["No", "Nama Pengendara", "UID Kartu", "Jam Masuk", "Jam Keluar", "Durasi"],
      rows: logs.map((log, index) => [
        String(index + 1),
        log.name_snapshot || 'Penyusup',
        log.uid_snapshot || '-',
        new Date(log.time_in).toLocaleString('id-ID'),
        log.time_out ? new Date(log.time_out).toLocaleString('id-ID') : 'MASIH DI DALAM',
        log.time_out ? formatWaktuAdaptifBackend(log.duration_seconds) : '-'
      ]),
    };

    // Render tabel dengan garis rapi
    await doc.table(table, {
      width: 535,
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
      prepareRow: () => doc.font("Helvetica").fontSize(9)
    });

    // Selesai nggambar!
    doc.end();

  } catch (error) {
    console.error("Error Generate PDF:", error);
    res.status(500).send("Gagal membuat PDF");
  }
};