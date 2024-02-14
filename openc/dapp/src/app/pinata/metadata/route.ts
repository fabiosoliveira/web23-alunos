import axios from "axios";

async function uploadMetadata(metadata: any): Promise<string> {
  const response = await axios({
    method: "POST",
    url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    data: {
      pinataContent: metadata,
      pinataMetadata: { name: metadata.name + ".json" },
    },
    headers: {
      pinata_api_key: `${process.env.API_KEY}`,
      pinata_secret_api_key: `${process.env.API_SECRET}`,
      "Content-Type": "application/json",
    },
  });

  return `ipfs://${response.data.IpfsHash}`;
}

export async function POST(request: Request) {
  const metadata = await request.json();
  const uri = await uploadMetadata(metadata);
  return Response.json({ uri });
}
