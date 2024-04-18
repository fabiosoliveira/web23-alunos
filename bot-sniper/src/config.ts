import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";

const MORALIS_API_KEY: string = `${process.env.MORALIS_API_KEY}`;
const TOKEN_ADDRESS: string = `${process.env.TOKEN_ADDRESS}`;
const WALLET: string = `${process.env.WALLET}`;
const PRIVATE_KEY: string = `${process.env.PRIVATE_KEY}`;
const NETWORK: string = `${process.env.NETWORK}`;
const INFURA_API_KEY: string = `${process.env.INFURA_API_KEY}`;
const INFURA_WS_URL: string = `${process.env.INFURA_WS_URL}`;
const ROUTER_ADDRESS: string = `${process.env.ROUTER_ADDRESS}`;
const FACTORY_ADDRESS: string = `${process.env.FACTORY_ADDRESS}`;
const EXCHANGE: string = `${process.env.EXCHANGE}`;
const TELEGRAM_BOT: string = `${process.env.TELEGRAM_BOT}`;
const CHAT_ID: string = `${process.env.CHAT_ID}`;
const INTERVAL: number = parseInt(`${process.env.INTERVAL}`);
const PRICE_TO_BUY: number = parseFloat(`${process.env.PRICE_TO_BUY}`);
const AMOUNT_TO_BUY: bigint = ethers.parseUnits(`${process.env.AMOUNT_TO_BUY}`, "ether");

export default {
    MORALIS_API_KEY,
    TOKEN_ADDRESS,
    FACTORY_ADDRESS,
    PRIVATE_KEY,
    NETWORK,
    WALLET,
    INFURA_API_KEY,
    ROUTER_ADDRESS,
    EXCHANGE,
    TELEGRAM_BOT,
    CHAT_ID,
    INTERVAL,
    PRICE_TO_BUY,
    AMOUNT_TO_BUY,
    INFURA_WS_URL
}