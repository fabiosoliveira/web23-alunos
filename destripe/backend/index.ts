import dotenv from "dotenv";
dotenv.config();

import artifacts from "./Destripe.json";

import { ethers } from "ethers";

function getContract(): ethers.Contract {
  const provider = new ethers.InfuraProvider(
    `${process.env.NETWORK}`,
    `${process.env.INFURA_API_KEY}`
  );
  return new ethers.Contract(
    `${process.env.DESTRIPE_CONTRACT}`,
    artifacts.abi,
    provider
  );
}

function getSigner(): ethers.Contract {
  const provider = new ethers.InfuraProvider(
    `${process.env.NETWORK}`,
    `${process.env.INFURA_API_KEY}`
  );
  const signer = new ethers.Wallet(`${process.env.PRIVATE_KEY}`, provider);
  return new ethers.Contract(
    `${process.env.DESTRIPE_CONTRACT}`,
    artifacts.abi,
    signer
  );
}

function getCustomers(): Promise<string[]> {
  return getContract().getCustomers();
}

type Customer = {
  tokenId: number;
  index: number;
  nextPayment: number;
};

function getCustomerInfo(customer: string): Promise<Customer> {
  return getContract().payments(customer) as Promise<Customer>;
}

async function pay(customer: string): Promise<string> {
  const tx = await getSigner().pay(customer);
  const receipt = await tx.wait();
  console.log(tx.hash);
  return tx.hash;
}

async function paymentCycle() {
  console.log(`Executing the payment cycle...`);
  const customers = await getCustomers();
  console.log(customers);

  for (let i = 0; i < customers.length; i++) {
    if (customers[i] === "0x0000000000000000000000000000000000000000") continue;

    const customer = await getCustomerInfo(customers[i]);
    //console.log(customer);
    //if (customer.nextPayment <= (Date.now() / 1000))
    await pay(customers[i]);
  }

  console.log(`Finishing the payment cycle...`);
}
paymentCycle();

setInterval(paymentCycle, 60 * 60 * 1000);

import app from "./app";

const PORT: number = parseInt(`${process.env.PORT || 3000}`);

app.listen(PORT, () => console.log(`App is running at ${PORT}`));
