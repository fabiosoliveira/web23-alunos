# blockchain

Project for module 03 > lesson 06.

## How to Test

1. git clone
2. cd blockchain
3. npm install
4. npx hardhat test

## How to Deploy

1. copy .env.example as .env
2. fill .env variables
3. check hardhat.config.ts
4. npx hardhat run scripts/deploy.ts --network <network name>
5. npx hardhat verify --network <network name> <contrato>