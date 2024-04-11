import dotenv from "dotenv";
dotenv.config();

const Module = require("module");
Module.prototype.require = new Proxy(Module.prototype.require, {
  apply(target, thisArg, argumentsList) {
    const name = argumentsList[0];
    if (/patch-core/g.test(name)) return {};

    return Reflect.apply(target, thisArg, argumentsList);
  },
});

import Web3Service from "./Web3Service";

const MAX_INTERVAL = parseInt(`${process.env.MAX_INTERVAL}`);

const MIN_INTERVAL = parseInt(`${process.env.MIN_INTERVAL}`);

const PRICE_TRIGGER = parseFloat(`${process.env.PRICE_TRIGGER}`);

import Binance from "node-binance-api";

const binance = new Binance({ family: 0, test: false });

let lastReceivedPrice = 0;
let lastRegisteredPrice = 0;
let lastRegisteredTimestamp = 0;

type TickerData = {
  close: number;
};

async function registerPrice() {
  if (!lastReceivedPrice) return console.log("Price not received yet.");

  lastRegisteredPrice = lastReceivedPrice;
  lastRegisteredTimestamp = Date.now();
  await Web3Service.setEthPrice(parseInt(`${lastReceivedPrice * 100}`));
  console.log("Price updated!");
}

const streamUrl = binance.websockets.prevDay(
  "SepoliaETHUSDT",
  async (data: any, converted: TickerData) => {
    lastReceivedPrice = converted.close;
    if (!lastRegisteredPrice) lastRegisteredPrice = lastReceivedPrice;

    const aMinuteAgo = Date.now() - MIN_INTERVAL;
    const priceChange = (lastReceivedPrice * 100) / lastRegisteredPrice - 100;

    console.log(lastReceivedPrice);
    console.log(priceChange.toFixed(2) + "%");

    if (
      Math.abs(priceChange) >= PRICE_TRIGGER &&
      lastRegisteredTimestamp < aMinuteAgo
    ) {
      await registerPrice();
    }
  },
  true
);
console.log(`Stream connected at ${streamUrl}`);

async function updateCycle() {
  console.log("Executing the update cycle...");
  const anHourAgo = Date.now() - MAX_INTERVAL;
  if (lastRegisteredTimestamp < anHourAgo) {
    await registerPrice();
  }
  console.log("Finishing the update cycle...");
}

//setTimeout(updateCycle, 5000);

setInterval(updateCycle, MAX_INTERVAL);

setInterval(async () => {
  const weiRatio = await Web3Service.getWeiRatio();
  const parity = await Web3Service.getParity(weiRatio);

  console.log(`Parity: ${parity}`);
  console.log(`Wei Ratio: ${weiRatio}`);
}, 60 * 1000);
