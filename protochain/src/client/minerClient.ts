import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import BlockInfo from "../lib/BlockInfo";
import Block from "../lib/Block";
import Wallet from "../lib/Wallet";
import Transaction from "../lib/Transaction";
import TransactionType from "../lib/TransactionType";

const instance = axios.create({
  baseURL: process.env.BLOCKCHAIN_SERVER,
});

const minerWallet = new Wallet(process.env.MINER_WALLET);

console.log("Logged as " + minerWallet.publicKey);

let totalMined = 0;

async function mine() {
  console.log("Getting next block info...");

  const { data: blockInfo } = await instance.get<BlockInfo>("/blocks/next");

  if (!blockInfo) {
    console.log("No tx found. Waiting...");
    return setTimeout(() => {
      mine();
    }, 5000);
  }

  const newBlock = Block.fromBlockInfo(blockInfo);

  newBlock.transactions.push(
    new Transaction({
      to: minerWallet.publicKey,
      type: TransactionType.FEE,
    } as Transaction)
  );

  newBlock.miner = minerWallet.publicKey;
  newBlock.hash = newBlock.getHash();

  console.log("Start mining block #" + blockInfo.index);
  newBlock.mine(blockInfo.difficulty, minerWallet.publicKey);

  console.log("Block mined! Sending to blockchain...");

  try {
    await instance.post("/blocks", newBlock);
    console.log("Block sent and accepted!");
    totalMined++;
    console.log("Total mined block: ", totalMined);
  } catch (error: any) {
    console.error(error.response ? error.response.data : error.message);
  }

  setTimeout(() => {
    mine();
  }, 1000);
}

mine();
