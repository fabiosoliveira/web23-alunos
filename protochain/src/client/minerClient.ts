import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import BlockInfo from "../lib/BlockInfo";
import Block from "../lib/Block";

const instance = axios.create({
  baseURL: process.env.BLOCKCHAIN_SERVER,
});

const minerWallet = {
  privateKey: "123456",
  publicKey: process.env.MINER_WALLET as string,
};

console.log("Logged as " + minerWallet.publicKey);

let totalMined = 0;

async function mine() {
  console.log("Getting next block info...");

  const { data: blockInfo } = await instance.get<BlockInfo>("/blocks/next");

  const newBlock = Block.fromBlockInfo(blockInfo);

  //TODO: adicionar tx de recompensa

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
