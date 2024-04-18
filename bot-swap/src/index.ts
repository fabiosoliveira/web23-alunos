//index.ts
import config from "./config";

import { ethers } from "ethers";

import Moralis from "moralis";

import { EvmChain } from "@moralisweb3/common-evm-utils";

import { Telegraf } from "telegraf";

import ABI_UNISWAP from "./abi.uniswap.json";
import ABI_ERC20 from "./abi.erc20.json";

const provider = new ethers.InfuraProvider(config.NETWORK, config.INFURA_API_KEY);
const signer = new ethers.Wallet(config.PRIVATE_KEY, provider);
const router = new ethers.Contract(config.ROUTER_ADDRESS, ABI_UNISWAP, signer);
const token0 = new ethers.Contract(config.TOKEN0_ADDRESS, ABI_ERC20, signer);
const token1 = new ethers.Contract(config.TOKEN1_ADDRESS, ABI_ERC20, signer);

let isOpened = false, isApproved = false;
let amountOut : bigint = BigInt(0);

const bot = new Telegraf(config.TELEGRAM_BOT);

async function getPrice(): Promise<number> {
    const { result } = await Moralis.EvmApi.token.getTokenPrice({
        address: config.TOKEN0_ADDRESS,
        chain: EvmChain.ETHEREUM,
        exchange: config.EXCHANGE
    })

    const message = "UNI in USD: " + result.usdPrice;
    console.log(message);

    return result.usdPrice;
}

type ExactInputSingleParams = {
    tokenIn: string;
    tokenOut: string;
    fee: number;
    recipient: string;
    deadline: number;
    amountIn: bigint;
    amountOutMinimum: number;
    sqrtPriceLimitX96: number;
}

async function approve(tokenContract: ethers.Contract, amount: bigint){
    const tx : ethers.TransactionResponse = await tokenContract.approve(config.ROUTER_ADDRESS, amount);
    console.log("Approving at " + tx.hash);
    await tx.wait();
}

async function swap(tokenIn: string, tokenOut: string, amountIn: bigint): Promise<bigint> {
    const params: ExactInputSingleParams = {
        tokenIn,
        tokenOut,
        fee: 3000,//0.3%
        recipient: config.WALLET,
        deadline: (Date.now() / 1000) + 10,
        amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
    };

    const tx: ethers.TransactionResponse = await router.exactInputSingle(params, {
        from: config.WALLET,
        gasPrice: ethers.parseUnits("10", "gwei"),
        gasLimit: 250000
    });

    console.log("Swapping at " + tx.hash);
    const receipt = await tx.wait();

    if (receipt) {
        const amountOut = ethers.toBigInt(receipt.logs[0].data);
        console.log("Received " + ethers.formatUnits(amountOut, "ether"));
        return amountOut;
    }

    return BigInt(0);
}

async function executionCycle() {
    const usdPrice = await getPrice();

    if(!isApproved){
        await approve(token1, config.AMOUNT_TO_BUY);
        isApproved = true;
    }

    if (usdPrice < config.PRICE_TO_BUY && !isOpened) {
        isOpened = true;
        amountOut = await swap(config.TOKEN1_ADDRESS, config.TOKEN0_ADDRESS, config.AMOUNT_TO_BUY);
        await bot.telegram.sendMessage(config.CHAT_ID, "Comprou em " + usdPrice);

        await approve(token0, amountOut);
    }
    else if (usdPrice > config.PRICE_TO_SELL && isOpened) {
        isOpened = false;
        await swap(config.TOKEN0_ADDRESS, config.TOKEN1_ADDRESS, amountOut);
        amountOut = BigInt(0);
        isApproved = false;
        await bot.telegram.sendMessage(config.CHAT_ID, "Vendeu em " + usdPrice);
    }
}

async function start() {
    await Moralis.start({
        apiKey: config.MORALIS_API_KEY
    })

    await executionCycle();

    setInterval(executionCycle, config.INTERVAL);
}

start();