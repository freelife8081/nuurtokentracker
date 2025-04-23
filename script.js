const TX_API = "https://60f3fd99-ba32-4d99-a43a-bd391a523514-00-2gmlythtcxcet.spock.replit.dev/"; // replace with your Replit URL

async function fetchTxs() {
  const res = await fetch(TX_API);
  const data = await res.json();

  if (!data || !data.txs) return;

  const txList = document.getElementById("tx-list");
  txList.innerHTML = "";

  data.txs.forEach(tx => {
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

setInterval(fetchTxs, 30000);
fetchTxs();
