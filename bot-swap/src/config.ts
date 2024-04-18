import dotenv from "dotenv";
dotenv.config();

const API_KEY: string = `${process.env.API_KEY}`;

const INTERVAL: number = parseInt(`${process.env.INTERVAL}`);

const TOKEN_ADDRESS: string = `${process.env.TOKEN_ADDRESS}`;

const EXCHANGE: string = `${process.env.EXCHANGE}`;

const TELEGRAM_BOT: string = `${process.env.TELEGRAM_BOT}`;

const CHAT_ID: string = `${process.env.CHAT_ID}`;

export default {
    API_KEY,
    INTERVAL,
    TOKEN_ADDRESS,
    EXCHANGE,
    TELEGRAM_BOT,
    CHAT_ID
}