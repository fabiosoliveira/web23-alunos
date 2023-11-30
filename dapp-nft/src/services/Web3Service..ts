import { ethers } from "ethers";
import ABI from "./ABI.json";

const CONTRACT_ADDRESS = String(process.env.CONTRACT_ADDRESS);
const NFT_PRICE = ethers.parseEther(String(process.env.NFT_PRICE));
