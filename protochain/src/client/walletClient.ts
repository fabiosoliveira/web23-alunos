import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import readline from "node:readline/promises";
import Wallet from "../lib/Wallet";
import { setTimeout } from "node:timers/promises";
import Transaction from "../lib/Transaction";
import TransactionType from "../lib/TransactionType";
import TransactionInput from "../lib/TransactionInput";

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SERVER;

let myWalletPub = "";
let myWalletPriv = "";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function menu() {
  await setTimeout(1000);
  console.clear();

  if (myWalletPub) {
    console.log(`You are logged as ${myWalletPub}`);
  } else {
    console.log("You are not logged.");
  }

  console.log("1 - Create wallet");
  console.log("2 - Recover wallet");
  console.log("3 - Balance");
  console.log("4 - Send tx");
  console.log("5 - Search tx");

  const answer = await rl.question("Choose your option: ");

  switch (answer) {
    case "1":
      createWallet();
      break;
    case "2":
      recoverWallet();
      break;
    case "3":
      getBalance();
      break;
    case "4":
      sendTx();
      break;
    case "5":
      searchTx();
      break;
    default: {
      console.log("Wrong option");
      menu();
    }
  }
}

menu();

async function preMenu() {
  await rl.question("Press any key to continue...");
  menu();
}
function createWallet() {
  console.clear();
  const wallet = new Wallet();
  console.log(`Your new wallet:`);
  console.log(wallet);

  myWalletPub = wallet.publicKey;
  myWalletPriv = wallet.privateKey;
  preMenu();
}

async function recoverWallet() {
  console.clear();
  const wifOrPrivateKey = await rl.question("What is your private key or WIF?");
  const wallet = new Wallet(wifOrPrivateKey);
  console.log(`Your recovered wallet:`);
  console.log(wallet);

  myWalletPub = wallet.publicKey;
  myWalletPriv = wallet.privateKey;
  preMenu();
}

function getBalance() {
  console.clear();

  if (!myWalletPub) {
    console.log("You don't have a wallet yet.");
    return preMenu();
  }

  //TODO: get balance via API

  preMenu();
}

async function sendTx() {
  console.clear();

  if (!myWalletPub) {
    console.log("You don't have a wallet yet.");
    return preMenu();
  }

  console.log(`Your wallet is ${myWalletPub}`);
  const toWallet = await rl.question("To Wallet: ");
  if (toWallet.length < 66) {
    console.log("Invalid wallet.");
    return preMenu();
  }

  const amountStr = await rl.question("Amount: ");
  const amount = parseInt(amountStr);
  if (!amount) {
    console.log("Invalid amount.");
    return preMenu();
  }

  //TODO: balance validation

  const tx = new Transaction();
  tx.timestamp = Date.now();
  tx.to = toWallet;
  tx.type = TransactionType.REGULAR;
  tx.txInput = new TransactionInput({
    amount,
    fromAddress: myWalletPub,
  } as TransactionInput);

  tx.txInput.sign(myWalletPriv);
  tx.hash = tx.getHash();

  try {
    const txResponse = await axios.post(`${BLOCKCHAIN_SERVER}transactions`, tx);
    console.log(
      `Transaction accepted. Waiting the miners: ${txResponse.data.hash}`
    );
  } catch (error: any) {
    console.error(error.response ? error.response.data : error.message);
  }

  preMenu();
}

async function searchTx() {
  console.clear();

  const hash = await rl.question("Your txHash: ");
  const response = await axios.get(`${BLOCKCHAIN_SERVER}transactions/${hash}`);
  console.log(response.data);
  preMenu();
}
