import axios from "axios";
import Web3 from "web3";

export async function mint() {
  if (!window.ethereum) throw new Error("No MetaMask found!");
  const web3 = new Web3(window.ethereum);
  const accounts = await web3.eth.requestAccounts();
  if (!accounts || !accounts.length) throw new Error("No accounts allowed!");

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_APP_API_URL}/mint/${accounts[0]}`
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw error.response.data;
    }
    throw error;
  }
}
