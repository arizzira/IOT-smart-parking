const axios = require('axios');

const TELEGRAM_BOT_TOKEN = '8774338524:AAEN6Dy7BwQPZaPztdDB-rSlwXzBIpnSN4Q'; // Token asli lu
const TELEGRAM_CHAT_ID = '1194776569'; // Masukin ID lu dari userinfobot

const kirimNotifikasiTelegram = async (pesan) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: pesan,
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error('❌ Gagal kirim Telegram:', error.message);
  }
};

module.exports = kirimNotifikasiTelegram;