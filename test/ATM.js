const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

function expandTo18Decimals(n) {
  return ethers.utils.parseUnits(n + "", 18);
}

describe("Test ATM", function () {
  let contract, owner, other, other1;
  const AMOUNT = expandTo18Decimals(10);
  const LIMIT_WITHDRAW = expandTo18Decimals(1000);
  const TOTAL_SUPPLY =  expandTo18Decimals(1000000);

  beforeEach(async function () {
    [owner, other, other1] = await ethers.getSigners();
    const Test = await ethers.getContractFactory("ATM", owner);
    contractD = await Test.deploy();
    contract = await contractD.deployed();
  });

  describe("get balance", function () {
    it("success", async function () {
      expect(await contract.balanceOf(owner.address)).to.be.eq(TOTAL_SUPPLY);
    });
  });

  describe("deposit", function () {
    it("success", async function () {
      expect(await contract.balanceOf(other.address)).to.be.eq(0);
      await expect(contract.connect(other).deposit({ value: AMOUNT }))
        .to.emit(contract, "Deposit")
        .withArgs(other.address, AMOUNT);
      expect(await contract.balanceOf(other.address)).to.be.eq(AMOUNT);
    });

    it("failure deposit Amount less than min transaction amount", async function () {
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
      await contract.connect(other).deposit({ value: AMOUNT });
      await expect(contract.connect(other).withdraw({ value: AMOUNT }))
        .to.emit(contract, "Withdraw")
        .withArgs(other.address, AMOUNT);
      expect(await contract.balanceOf(other.address)).to.be.eq(0);
    });

    it("failure withdraw Amount less than min transaction amount", async function () {
      await expect(
        contract.connect(other).withdraw({ value: 0 })
      ).to.be.revertedWith("Amount less than min transaction amount");
    });

    it("failure Invalid withdraw amount", async function () {
      const balanceBefore = await contract.balanceOf(other.address);
      await expect(
        contract
          .connect(other)
          .withdraw({ value: balanceBefore.add(expandTo18Decimals(10)) })
      ).to.be.revertedWith("Invalid withdraw amount");
    });

    it("failure Limit withdraw amount", async function () {
      await contract
        .connect(other)
        .deposit({ value: LIMIT_WITHDRAW.add(expandTo18Decimals(10)) });
      await expect(
        contract
          .connect(other)
          .withdraw({ value: LIMIT_WITHDRAW.add(expandTo18Decimals(10)) })
      ).to.be.revertedWith("Limit withdraw amount");
    });
  });

  describe("transfer", function () {
    it("success", async function () {
      const balanceBefore = await contract.balanceOf(other1.address);
      await expect(contract.transfer(other1.address, AMOUNT))
        .to.emit(contract, "Transfer")
        .withArgs(owner.address, other1.address, AMOUNT);
      expect(await contract.balanceOf(other1.address)).to.be.eq(
        balanceBefore.add(AMOUNT)
      );
    });

    it("failure transfer amount less than min transaction amount", async function () {
      await expect(contract.transfer(other1.address, 0)).to.be.revertedWith(
        "Transfer amount less than min transaction amount"
      );
    });
  });
});
