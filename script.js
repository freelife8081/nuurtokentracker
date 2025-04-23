const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

const BOT_TOKEN = '8147327939:AAFlSSguXx5I4TplErHizfMKts2a-UwFjk8';
const CHAT_ID = '5952407902';

let lastTxHash = null;

app.get('/latest-txs', async (req, res) => {
  try {
    const url = 'https://ledger.sidrachain.com/api/v1/token/0x3f2C99C23eE666096d2cFda162A4bFBcC4AE8de8/transfers';
    const response = await fetch(url);
    const data = await response.json();
    const txs = data.transfers || [];

    const newTxs = [];
    for (let tx of txs) {
      if (tx.hash === lastTxHash) break;
      newTxs.push(tx);
    }

    if (newTxs.length > 0) {
      lastTxHash = newTxs[0].hash;
      for (let tx of newTxs.reverse()) {
        await sendToTelegram(tx);
      }
    }

    res.json({ success: true, txs: txs.slice(0, 10) });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

function sendToTelegram(tx) {
  const msg = `📦 *New NOOR Transaction*\n\n` +
              `🧾 Hash: \`${tx.hash}\`\n` +
              `👤 From: \`${tx.from_address}\`\n` +
              `👥 To: \`${tx.to_address}\`\n` +
              `💰 Amount: ${parseFloat(tx.value).toFixed(4)}\n` +
              `⏱ Time: ${new Date(tx.timestamp * 1000).toLocaleString()}`;

  return fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: msg,
      parse_mode: 'Markdown'
    })
  });
}

app.listen(3000, () => console.log('Backend running on port 3000'));
