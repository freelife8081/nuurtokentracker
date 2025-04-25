const connectBtn = document.getElementById("connectBtn");
const checkBtn = document.getElementById("checkEligibilityBtn");
const claimBtn = document.getElementById("claimBtn");
const result = document.getElementById("result");

const NUR_TOKEN_ADDRESS = "0x3f2C99C23eE666096d2cFda162A4bFBcC4AE8de8";
const AIRDROP_CONTRACT_ADDRESS = "0x2B5dB4de40A5C6b6055F7a81764d02CD4c14F8eE";
const AIRDROP_ABI = [{"inputs":[{"internalType":"address","name":"_nurTokenAddress","type":"address"},{"internalType":"uint256","name":"_claimStartTime","type":"uint256"},{"internalType":"uint256","name":"_claimEndTime","type":"uint256"},{"internalType":"address","name":"_presaleContract","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"AirdropClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"claimAirdrop","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimEndTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimStartTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasClaimed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasReceivedFromPresale","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nurToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"presaleContract","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"setReceivedFromPresale","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawUnclaimed","outputs":[],"stateMutability":"nonpayable","type":"function"}];

let provider;
let signer;
let userAddress;

connectBtn.onclick = async () => {
  if (window.ethereum) {
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      userAddress = await signer.getAddress();
      checkBtn.disabled = false;
      result.textContent = "✅ Connected to Sidra Chain.";
    } catch (err) {
      console.error(err);
      result.textContent = "❌ Connection failed.";
    }
  } else {
    alert("MetaMask not found!");
  }
};

checkBtn.onclick = async () => {
  result.textContent = "🔍 Checking eligibility...";
  claimBtn.style.display = "none";

  try {
    const nurContract = new ethers.Contract(
      NUR_TOKEN_ADDRESS,
      ["function balanceOf(address owner) view returns (uint256)"],
      provider
    );

    const balance = await nurContract.balanceOf(userAddress);
    const humanReadable = Number(ethers.utils.formatUnits(balance, 18));

    let reward = 0;

    if (humanReadable >= 500000 && humanReadable < 1000000) {
      reward = 500;
    } else if (humanReadable >= 1000000 && humanReadable <= 1500000) {
      reward = 1000;
    } else if (humanReadable >= 1600000) {
      reward = 5000;
    }

    if (reward > 0) {
      result.textContent = `🎉 You're eligible for ${reward} NUR!`;
      claimBtn.style.display = "inline-block";
      claimBtn.setAttribute("data-reward", reward);
    } else {
      result.textContent = "⚠️ Sorry, you're not eligible for the airdrop.";
    }

  } catch (err) {
    console.error("Error checking eligibility", err);
    result.textContent = "❌ Error checking eligibility.";
  }
};

claimBtn.onclick = async () => {
  try {
    const contract = new ethers.Contract(
      AIRDROP_CONTRACT_ADDRESS,
      AIRDROP_ABI,
      signer
    );

    const tx = await contract.claimAirdrop();
    result.textContent = "⏳ Transaction sent. Waiting for confirmation...";
    await tx.wait();
    result.textContent = "✅ Airdrop successfully claimed!";
    claimBtn.style.display = "none";
  } catch (err) {
    console.error("Claim failed", err);
    result.textContent = "❌ Claim failed. You might have already claimed or you haven't purchased the token on the presale market";
  }
};
