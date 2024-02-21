import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";

import { ethers } from "ethers";
import artifacts from "./DestripeCollection.json";
import cors from "cors";

function getContract(): ethers.Contract {
  const provider = new ethers.InfuraProvider(
    `${process.env.NETWORK}`,
    `${process.env.INFURA_API_KEY}`
  );
  return new ethers.Contract(
    `${process.env.COLLECTION_CONTRACT}`,
    artifacts.abi,
    provider
  );
}

function ownerOf(tokenId: number): Promise<string> {
  return getContract().ownerOf(tokenId);
}

const app = express();

app.use(
  cors({
    origin: `${process.env.CORS_ORIGIN}`,
  })
);

app.use(morgan("tiny"));
app.use(express.json());

app.get(
  "/nfts/:tokenId",
  async (req: Request, res: Response, next: NextFunction) => {
    const tokenId = req.params.tokenId.replace(".json", "");

    const ownerAddress = await ownerOf(parseInt(tokenId));
    if (ownerAddress === ethers.ZeroAddress) return res.sendStatus(404);

    res.json({
      name: "Access #" + tokenId,
      description: "Your access to the system X",
      image: `${process.env.BACKEND_URL}/images/${tokenId}.png`,
    });
  }
);

app.get(
  "/images/:tokenId",
  async (req: Request, res: Response, next: NextFunction) => {
    const tokenId = req.params.tokenId.replace(".png", "");

    const ownerAddress = await ownerOf(parseInt(tokenId));
    if (ownerAddress === ethers.ZeroAddress) return res.sendStatus(404);

    res.download(`${__dirname}/ticket.png`);
  }
);

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

async function pay(customer: string): Promise<string> {
  const tx = await getSigner().pay(customer);
  const receipt = await tx.wait();
  console.log(tx.hash);
  return tx.hash;
}

app.post(
  "/subscribe/:customer",
  async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.params.customer;
    await pay(customer);
    res.sendStatus(201);
  }
);

export default app;
