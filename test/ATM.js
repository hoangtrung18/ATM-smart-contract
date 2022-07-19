const { expect } = require("chai")
const { ethers } = require("hardhat")

function expandTo18Decimals(n) {
    return ethers.utils.parseUnits(n + '', 18)
}

describe('Test ATM', function () {
    let contract, owner, other
    const ZERO_ADDRESS = ethers.constants.AddressZero

    beforeEach(async function () {
        [owner, other] = await ethers.getSigners()
        const Test = await ethers.getContractFactory("ATM", owner)
        contractD = await Test.deploy()
        contract = await contractD.deployed()
    })

    describe('deposit', function () {
        it('success', async function () {
            const amount = expandTo18Decimals(0.01)
            expect(await contract.balanceOf(other.address)).to.be.eq(0)
            await expect(contract.connect(other).deposit({ value: amount }))
                .to.emit(contract, "Deposit")
                .withArgs(other.address, amount);
            expect(await contract.balanceOf(other.address)).to.be.eq(amount)
        })

        it('failure deposit', async function () {
            await expect(contract.connect(other).deposit({ value: 0 })).to.be.revertedWith('Amount less than min transaction amount')
        })
    })

    describe('withdraw', function () {
        it('success', async function () {
            const amount = expandTo18Decimals(10)
           await contract.connect(other).deposit({ value: amount })
           await expect(contract.connect(other).withdraw({ value: amount }))
           .to.emit(contract, "Withdraw")
           .withArgs(other.address, amount);
            expect(await contract.balanceOf(other.address)).to.be.eq(0)
        })

        it('failure withdraw', async function () {
            await expect(contract.connect(other).deposit({ value: 0 })).to.be.revertedWith('Amount less than min transaction amount')
        })
    })
})