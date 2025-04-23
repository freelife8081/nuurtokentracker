const TX_API = "https://corsproxy.io/?" + encodeURIComponent("https://ledger.sidrachain.com/api/v1/token/0x3f2C99C23eE666096d2cFda162A4bFBcC4AE8de8/transfers");
const TELEGRAM_API = "https://api.telegram.org/bot8147327939:AAFlSSguXx5I4TplErHizfMKts2a-UwFjk8/sendMessage";
const CHAT_ID = "5952407902E";

let lastTxHash = null;

async function fetchAndDisplayTxs() {
  try {
    const res = await fetch(TX_API);
    const data = await res.json();
    const txs = data.transfers || [];

    if (!txs.length) return;

    const newTxs = [];
    for (let tx of txs) {
      if (tx.hash === lastTxHash) break;
      newTxs.push(tx);
    }

    if (newTxs.length > 0) {
      lastTxHash = newTxs[0].hash;
      showTxs(newTxs);
      newTxs.reverse().forEach(sendToTelegram);
    }

  } catch (err) {
    console.error("Fetch failed", err);
  }
}

function showTxs(txs) {
  const txList = document.getElementById("tx-list");
  txList.innerHTML = "";

  txs.forEach(tx => {
    const li = document.createElement("li");
    li.className = "tx";
    li.innerHTML = `
      <strong>Hash:</strong> ${tx.hash.slice(0, 10)}...<br>
      <strong>From:</strong> ${tx.from_address}<br>
      <strong>To:</strong> ${tx.to_address}<br>
      <strong>Amount:</strong> ${parseFloat(tx.value).toFixed(4)}<br>
      <strong>Time:</strong> ${new Date(tx.timestamp * 1000).toLocaleString()}
    `;
    txList.appendChild(li);
  });
}

function sendToTelegram(tx) {
  const msg = `📦 *New NOOR Transaction*\n\n` +
              `🧾 Hash: \`${tx.hash}\`\n` +
              `👤 From: \`${tx.from_address}\`\n` +
              `👥 To: \`${tx.to_address}\`\n` +
              `💰 Amount: ${parseFloat(tx.value).toFixed(4)}\n` +
              `⏱ Time: ${new Date(tx.timestamp * 1000).toLocaleString()}`;

  fetch(`${TELEGRAM_API}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: msg,
      parse_mode: "Markdown"
    })
  });
}

// Refresh every 30 seconds
setInterval(fetchAndDisplayTxs, 30000);
fetchAndDisplayTxs();
