const { ethers } = require("hardhat");

async function deploy() {
  console.log("Deploy");
  const Contract = await ethers.getContractFactory("Contract");
  const contract = await Contract.deploy('paramA');
  console.log("TX:", contract.deployTransaction.hash);
  token = await contract.deployed();
  console.log("Token address:", token.address);
  return token.address;
}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
