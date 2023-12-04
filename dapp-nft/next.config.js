/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  env: {
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    NFT_PRICE: process.env.NFT_PRICE,
    OPENSEA_URL: process.env.OPENSEA_URL,
    CHAIN_ID: process.env.CHAIN_ID,
  },
};

module.exports = nextConfig;
