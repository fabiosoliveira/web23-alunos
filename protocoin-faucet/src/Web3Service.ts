export async function mint() {
  if (!window.ethereum) {
    alert("Please install metamask");
  } else {
    alert("Minting...");
  }
}
