//index.ts
import config from "./config";

import Moralis from "moralis";

import { EvmChain } from "@moralisweb3/common-evm-utils";


async function getPrice(): Promise<number> {
    const { result } = await Moralis.EvmApi.token.getTokenPrice({
        address: config.TOKEN_ADDRESS,
        chain: EvmChain.ETHEREUM,
        exchange: config.EXCHANGE
    })

    const message = "WETH in USD: " + result.usdPrice;
    console.log(message);

    return result.usdPrice;
}

async function start() {
    await Moralis.start({
        apiKey: config.API_KEY
    })

    await getPrice();

    setInterval(getPrice, config.INTERVAL);
}

start();