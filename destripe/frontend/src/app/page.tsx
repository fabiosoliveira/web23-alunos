import { ethers } from "ethers";
import axios from "axios";

export default function Home() {
  async function subscribe() {
    const customerAddress = "0x5002f43d58F4cF76F4d659DD055110149a3beBf2";

    const provider = new ethers.BrowserProvider(window.ethereum);
    const destripeCoin = new ethers.Contract(
      "0x7bAeF326dbD7cc9173D39c7B4652ef60d8138bf4",
      [],
      provider
    );
    const tx = await destripeCoin.approve(
      "0x75a5c4b84b2b43d28481fF7f329EB15F2Ec6fbDD",
      ethers.parseEther("0.01")
    );
    await tx.wait();

    const response = await axios.post(
      "http://localhost:3001/subscribe/0x5002f43d58F4cF76F4d659DD055110149a3beBf2"
    );
    console.log(response.data);
  }

  async function doLogin() {
    const customerAddress = "0x5002f43d58F4cF76F4d659DD055110149a3beBf2";

    const provider = new ethers.BrowserProvider(window.ethereum);
    const destripe = new ethers.Contract(
      "0x75a5c4b84b2b43d28481fF7f329EB15F2Ec6fbDD",
      [],
      provider
    );
    const collection = new ethers.Contract(
      "0x32B31a1A65e21148f333B4c6D0a8720fE0fcea0E",
      [],
      provider
    );

    const customerInfo = await destripe.payments(customerAddress);
    const ownerAddress = await collection.ownerOf(customerInfo.tokenId);

    if (ownerAddress === customerAddress) console.log("Authorized");
    else console.log("Unauthorized");
  }

  return <></>;
}
