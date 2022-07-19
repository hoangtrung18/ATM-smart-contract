const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

function expandTo18Decimals(n) {
  return ethers.utils.parseUnits(n + "", 18);
}

describe("Test ATM", function () {
  let contract, owner, other;
  const ZERO_ADDRESS = ethers.constants.AddressZero;

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();
    const Test = await ethers.getContractFactory("ATM", owner);
    contractD = await Test.deploy();
    contract = await contractD.deployed();
  });

  describe("deposit", function () {
    it("success", async function () {
      const amount = expandTo18Decimals(0.01);
      expect(await contract.balanceOf(other.address)).to.be.eq(0);
      await expect(contract.connect(other).deposit({ value: amount }))
        .to.emit(contract, "Deposit")
        .withArgs(other.address, amount);
      expect(await contract.balanceOf(other.address)).to.be.eq(amount);
    });

    it("failure deposit", async function () {
      await expect(
        contract.connect(other).deposit({ value: 0 })
      ).to.be.revertedWith("Amount less than min transaction amount");
    });
  });

  describe("owner set limit withdraw", function () {
    it("success", async function () {
      const currentLimitAmount = await contract._limitWithdraw();
      const newLimit = currentLimitAmount.add(expandTo18Decimals(10));
      contract.setLimitWithdraw(newLimit);
      expect(await contract._limitWithdraw()).to.be.eq(newLimit);
    });

    it("failure if caller is not the owner ", async function () {
      await expect(
        contract.connect(other).setLimitWithdraw(expandTo18Decimals(0))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("failure set limit withdraw", async function () {
      await expect(
        contract.setLimitWithdraw(expandTo18Decimals(0))
      ).to.be.revertedWith("Limit amount withdraw should be great than 0");
    });
  });

  describe("withdraw", function () {
    it("success", async function () {
      const amount = expandTo18Decimals(10);
      await contract.connect(other).deposit({ value: amount });
      await expect(contract.connect(other).withdraw({ value: amount }))
        .to.emit(contract, "Withdraw")
        .withArgs(other.address, amount);
      expect(await contract.balanceOf(other.address)).to.be.eq(0);
    });

    it("failure withdraw", async function () {
      await expect(
        contract.connect(other).deposit({ value: 0 })
      ).to.be.revertedWith("Amount less than min transaction amount");
    });
  });
});
