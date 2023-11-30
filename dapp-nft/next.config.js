/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    NFT_PRICE: process.env.NFT_PRICE,
    OPENSEA_URL: process.env.OPENSEA_URL,
  },
};

module.exports = nextConfig;
