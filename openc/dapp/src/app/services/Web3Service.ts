import axios from "axios";
import { EventLog, ethers } from "ethers";
import NFTCollectionABI from "./NFTCollection.abi.json";
import NFTMarketABI from "./NFTMarket.abi.json";

const MARKETPLACE_ADDRESS = `${process.env.MARKETPLACE_ADDRESS}`;
const COLLECTION_ADDRESS = `${process.env.COLLECTION_ADDRESS}`;
const CHAIN_ID = `0x${Number(process.env.CHAIN_ID).toString(16)}`;

export type NewNFT = {
  name?: string;
  description?: string;
  price?: string;
  image?: File;
};

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios({
    method: "POST",
    url: "/pinata/file",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });

  return `${response.data.uri}`;
}

async function uploadMetadata(metadata: Metadata) {
  const response = await axios({
    method: "POST",
    url: "/pinata/metadata",
    data: metadata,
    headers: { "Content-Type": "application/json" },
  });

  return `${response.data.uri}`;
}

type Metadata = {
  name?: string;
  description?: string;
  image?: string;
};

async function getProvider() {
  if (!window.ethereum) throw new Error(`Wallet not found!`);

  const provider = new ethers.BrowserProvider(window.ethereum);

  const accounts: string[] = await provider.send("eth_requestAccounts", []);

  if (!accounts || !accounts.length) throw new Error(`Wallet not permitted!`);

  await provider.send("wallet_switchEthereumChain", [{ chainId: CHAIN_ID }]);

  return provider;
}

export type NFT = {
  itemId: number;
  tokenId: number;
  price: bigint | string;
  seller: string;
  owner: string;
  image: string;
  name: string;
  description: string;
};

export async function loadDetails(itemId: number): Promise<NFT> {
  const provider = await getProvider();
  const marketContract = new ethers.Contract(
    MARKETPLACE_ADDRESS,
    NFTMarketABI,
    provider
  );
  const collectionContract = new ethers.Contract(
    COLLECTION_ADDRESS,
    NFTCollectionABI,
    provider
  );

  const item: NFT = await marketContract.marketItems(itemId);
  if (!item) return {} as NFT;

  const tokenUri = await collectionContract.tokenURI(item.tokenId);
  const metadata = await axios.get(
    tokenUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
  );
  const price = ethers.formatUnits(item.price.toString(), "ether");

  return {
    price,
    itemId: item.itemId,
    tokenId: item.tokenId,
    seller: item.seller,
    owner: item.owner,
    image: metadata.data.image.replace(
      "ipfs://",
      "https://gateway.pinata.cloud/ipfs/"
    ),
    name: metadata.data.name,
    description: metadata.data.description,
  } as NFT;
}

export async function buyNFT(nft: NFT) {
  const provider = await getProvider();
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(
    MARKETPLACE_ADDRESS,
    NFTMarketABI,
    signer
  );
  const price = ethers.parseUnits(nft.price.toString(), "ether");

  const tx = await contract.createMarketSale(COLLECTION_ADDRESS, nft.itemId, {
    value: price,
  });
  await tx.wait();
}

async function createItem(url: string, price: string): Promise<number> {
  const provider = await getProvider();
  const signer = await provider.getSigner();

  //mint NFT
  const collectionContract = new ethers.Contract(
    COLLECTION_ADDRESS,
    NFTCollectionABI,
    signer
  );
  const mintTx = await collectionContract.mint(url);
  const mintTxReceipt: ethers.ContractTransactionReceipt = await mintTx.wait();
  let eventLog = mintTxReceipt.logs[0] as EventLog;
  const tokenId = Number(eventLog.args[2]);

  //create market item
  const weiPrice = ethers.parseUnits(price, "ether");
  const marketContract = new ethers.Contract(
    MARKETPLACE_ADDRESS,
    NFTMarketABI,
    signer
  );
  const listingPrice = (await marketContract.listingPrice()).toString();
  const createTx = await marketContract.createMarketItem(
    COLLECTION_ADDRESS,
    tokenId,
    weiPrice,
    { value: listingPrice }
  );
  const createTxReceipt: ethers.ContractTransactionReceipt =
    await createTx.wait();

  eventLog = createTxReceipt.logs.find(
    (l) => (l as EventLog).eventName === "MarketItemCreated"
  ) as EventLog;
  const itemId = Number(eventLog.args[0]);

  return itemId;
}

export async function uploadAndCreate(nft: NewNFT): Promise<number> {
  if (!nft.name || !nft.description || !nft.image || !nft.price)
    throw new Error("All fields are required.");

  const uri = await uploadFile(nft.image);

  const metadataUri = await uploadMetadata({
    name: nft.name,
    description: nft.description,
    image: uri,
  });

  const itemId = await createItem(metadataUri, nft.price);

  return itemId;
}
