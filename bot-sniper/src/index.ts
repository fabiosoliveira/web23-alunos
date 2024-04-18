//index.ts
import config from "./config";

import { ethers, WebSocketLike } from "ethers";

import Moralis from "moralis";

import { EvmChain } from "@moralisweb3/common-evm-utils";

import { Telegraf } from "telegraf";

import ABI_ROUTER from "./abi.router.json";
import ABI_FACTORY from "./abi.factory.json";
import ABI_ERC20 from "./abi.erc20.json";

const provider = new ethers.InfuraProvider(config.NETWORK, config.INFURA_API_KEY);
const signer = new ethers.Wallet(config.PRIVATE_KEY, provider);

let isOpened = false, isApproved = false;
let amountOut: bigint = BigInt(0);

const bot = new Telegraf(config.TELEGRAM_BOT);

async function getPrice(tokenAddress: string): Promise<number> {
    const { result } = await Moralis.EvmApi.token.getTokenPrice({
        address: tokenAddress,
        chain: EvmChain.ETHEREUM,
        exchange: config.EXCHANGE
    })

    const message = "Price in USD: " + result.usdPrice;
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

async function approve(tokenContract: ethers.Contract, amount: bigint) {
    const tx: ethers.TransactionResponse = await tokenContract.approve(config.ROUTER_ADDRESS, amount);
    console.log("Approving at " + tx.hash);
    await tx.wait();
}

async function swap(tokenIn: string, tokenOut: string, amountIn: bigint, fee: number): Promise<bigint> {
    const router = new ethers.Contract(config.ROUTER_ADDRESS, ABI_ROUTER, signer);
    const params: ExactInputSingleParams = {
        tokenIn,
        tokenOut,
        fee,
        recipient: config.WALLET,
        deadline: Date.now() + 30000,
        amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
    };

    const tx: ethers.TransactionResponse = await router.exactInputSingle(params, {
        from: config.WALLET,
        gasPrice: ethers.parseUnits("10", "gwei"),
        gasLimit: 300000
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

// async function executionCycle() {
//     const usdPrice = await getPrice();

//     if(!isApproved){
//         await approve(token1, config.AMOUNT_TO_BUY);
//         isApproved = true;
//     }

//     if (usdPrice < config.PRICE_TO_BUY && !isOpened) {
//         isOpened = true;
//         amountOut = await swap(config.TOKEN1_ADDRESS, config.TOKEN0_ADDRESS, config.AMOUNT_TO_BUY);
//         await bot.telegram.sendMessage(config.CHAT_ID, "Comprou em " + usdPrice);

//         await approve(token0, amountOut);
//     }
//     else if (usdPrice > config.PRICE_TO_SELL && isOpened) {
//         isOpened = false;
//         await swap(config.TOKEN0_ADDRESS, config.TOKEN1_ADDRESS, amountOut);
//         amountOut = BigInt(0);
//         isApproved = false;
//         await bot.telegram.sendMessage(config.CHAT_ID, "Vendeu em " + usdPrice);
//     }
// }

type WebSocketSniper = WebSocketLike & { ping: () => void };

async function start() {
    await Moralis.start({
        apiKey: config.MORALIS_API_KEY
    })

    if (!isApproved) {
        const token = new ethers.Contract(config.TOKEN_ADDRESS, ABI_ERC20, signer);
        await approve(token, config.AMOUNT_TO_BUY);
        isApproved = true;
    }

    const wsProvider = new ethers.WebSocketProvider(config.INFURA_WS_URL);
    const factory = new ethers.Contract(config.FACTORY_ADDRESS, ABI_FACTORY, wsProvider);

    factory.on("PoolCreated", async (token0, token1, fee, tickSpacing, pool) => {
        console.log("Snipe!");
        console.log(token0, token1, fee, tickSpacing, pool);

        if(!isOpened && token1 === config.TOKEN_ADDRESS){
            console.log("New pool with WETH, let's buy it!");
            isOpened = true;

            amountOut = await swap(config.TOKEN_ADDRESS, token0, config.AMOUNT_TO_BUY, fee);
            console.log("Swapped succesfully!");
        }
    })

    setInterval(() => (wsProvider.websocket as WebSocketSniper).ping(), 60000);

    console.log("Waiting for new pools...");

    //await executionCycle();

    //setInterval(executionCycle, config.INTERVAL);
}

start();