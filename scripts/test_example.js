const { expect } = require("chai")
const { ethers } = require("hardhat")

function expandTo18Decimals(n) {
    return new ethers.BigNumber.from(n).mul(
        new ethers.BigNumber.from(10).pow(18)
    );
}

describe('Test', function () {
    let contract, owner, other
    const ZERO_ADDRESS = ethers.constants.AddressZero

    beforeEach(async function () {
        [owner, other] = await ethers.getSigners()
        const Contract = await ethers.getContractFactory("Contract_name", owner)
        contractD = await Contract.deploy('constructor_params')
        contract = await contractD.deployed()
    })

    describe('init', function () {
        it('equal', async function () {
            expect(await contract.example()).to.be.eq(50)
        })

        it('revertedWith', async function () {
            await expect(contract.connect(other).example()).to.be.revertedWith('Error')
        })

        it('emit even', async function () {
            await expect(contract.connect(other).example())
                .to.emit(contract, "Test_event")
                .withArgs('a', 'b');
        })
    })
})