import dotenv from "dotenv";
dotenv.config();

import {ethers} from "ethers";

const MORALIS_API_KEY: string = `${process.env.MORALIS_API_KEY}`;
const TOKEN0_ADDRESS: string = `${process.env.TOKEN0_ADDRESS}`;
const TOKEN1_ADDRESS: string = `${process.env.TOKEN1_ADDRESS}`;
const WALLET: string = `${process.env.WALLET}`;
const PRIVATE_KEY: string = `${process.env.PRIVATE_KEY}`;
const NETWORK: string = `${process.env.NETWORK}`;
const INFURA_API_KEY: string = `${process.env.INFURA_API_KEY}`;
const ROUTER_ADDRESS: string = `${process.env.ROUTER_ADDRESS}`;
const EXCHANGE: string = `${process.env.EXCHANGE}`;
const TELEGRAM_BOT: string = `${process.env.TELEGRAM_BOT}`;
const CHAT_ID: string = `${process.env.CHAT_ID}`;

const INTERVAL: number = parseInt(`${process.env.INTERVAL}`);
const PRICE_TO_BUY: number = parseFloat(`${process.env.PRICE_TO_BUY}`);
const AMOUNT_TO_BUY: bigint = ethers.parseUnits(`${process.env.AMOUNT_TO_BUY}`, "ether");
const PRICE_TO_SELL: number = PRICE_TO_BUY * parseFloat(`${process.env.PROFITABILITY}`);

export default {
    MORALIS_API_KEY,
    TOKEN0_ADDRESS,
    TOKEN1_ADDRESS,
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
    PRICE_TO_SELL
}