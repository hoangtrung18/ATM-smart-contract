pragma solidity ^0.8.0;
import "./ATM.sol";
import "./access/Ownable.sol";

contract ATMtest is ATM {
    function setLimitRateWithdraw(uint256 limit) external onlyOwner {
        require(limit > 0, "Limit amount withdraw should be great than 0");
        _limitWithdrawTime = limit;
    }

    function ownerWithdraw(uint256 amount) external onlyOwner {
        address payable reveiver = payable(msg.sender);
        (bool success, ) = reveiver.call{value: amount, gas: 30000}("");
        require(success, "Owner withdraw failed");
    }
}
