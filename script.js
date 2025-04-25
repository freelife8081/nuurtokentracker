const connectBtn = document.getElementById("connectBtn");
const checkBtn = document.getElementById("checkEligibilityBtn");
const claimBtn = document.getElementById("claimBtn");
const result = document.getElementById("result");
const networkStatus = document.getElementById("networkStatus");

const sidraParams = {
  chainId: "0x17D6D", // 97453 in hex
  chainName: "Sidra Chain",
  nativeCurrency: {
    name: "Sidra",
    symbol: "SDA",
    decimals: 18,
  },
  rpcUrls: ["https://node.sidrachain.com"],
  blockExplorerUrls: ["https://ledger.sidrachain.com"]
};

const NUR_TOKEN_ADDRESS = "0xYourNurTokenAddress";
const AIRDROP_CONTRACT_ADDRESS = "0xYourAirdropContractAddress";
const AIRDROP_ABI = [ // Minimal ABI to interact with `claimAirdrop`
  {
    "inputs": [],
    "name": "claimAirdrop",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

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
      await switchToSidra();
      checkBtn.disabled = false;
      networkStatus.textContent = "Connected to Sidra Chain.";
    } catch (err) {
      console.error(err);
      networkStatus.textContent = "Connection failed.";
    }
  } else {
    alert("MetaMask not found!");
  }
};

async function switchToSidra() {
  try {
    await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [sidraParams],
    });
  } catch (err) {
    console.error("Network switch failed", err);
  }
}

checkBtn.onclick = async () => {
  result.textContent = "Checking eligibility...";
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
      result.textContent = `You're eligible for ${reward} NUR!`;
      claimBtn.style.display = "inline-block";
      claimBtn.setAttribute("data-reward", reward);
    } else {
      result.textContent = "Sorry, you're not eligible for the airdrop.";
    }

  } catch (err) {
    console.error("Error checking eligibility", err);
    result.textContent = "Error checking eligibility.";
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
    result.textContent = "Transaction sent. Waiting for confirmation...";
    await tx.wait();
    result.textContent = "Airdrop successfully claimed!";
    claimBtn.style.display = "none";
  } catch (err) {
    console.error("Claim failed", err);
    result.textContent = "Claim failed. You might have already claimed.";
  }
};
