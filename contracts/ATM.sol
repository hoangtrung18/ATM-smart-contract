pragma solidity ^0.8.0;
import "./interfaces/IERC20.sol";
import "./access/Ownable.sol";

contract ATM is Ownable {
    mapping(address => uint256) private _balances;
    mapping(address => uint256) private _limitWithdrawAmount;
    mapping(address => uint256) private _curentLimitWithdrawCount;
    mapping(address => uint256) private _lastWithdraw;
    uint256 public _limitTime = 600; //10 min
    uint256 public _limitWithdraw = 1000 * 10**18;
    uint256 public _limitWithdrawTime = 10; //10 times
    uint256 public _mintTransactionAmount = 0.01 * 10**18;
    uint256 _totalSupply = 1000000 * 10**18;

    constructor() {
        _balances[msg.sender] = uint256(_totalSupply);
    }

    modifier verifyAmount() {
        require(
            msg.value >= _mintTransactionAmount,
            "Amount less than min transaction amount"
        );
        _;
    }

    function deposit() external payable verifyAmount {
        uint256 amount = msg.value;
        address requestAddress = msg.sender;
        _balances[requestAddress] += amount;
        emit Deposit(requestAddress, amount);
    }

    function balanceOf(address account)
        external
        view
        virtual
        returns (uint256)
    {
        return _balances[account];
    }

    function setLimitTime(uint256 limit) external onlyOwner {
        require(limit > 0, "Limit time should be great than 0");
        _limitTime = limit;
    }

    function setLimitWithdraw(uint256 limit) external onlyOwner {
        require(limit > 0, "Limit amount withdraw should be great than 0");
        _limitWithdraw = limit;
    }

    function withdraw(uint256 amount) external {
        require(
            amount >= _mintTransactionAmount,
            "Withdraw amount less than min transaction amount"
        );
        address requestAddress = msg.sender;
        address payable reveiver = payable(requestAddress);
        require(amount <= _balances[requestAddress], "Invalid withdraw amount");
        uint256 curentLimitWithdraw = _limitWithdrawAmount[requestAddress];
        uint256 curentLimitWithdrawTime = _curentLimitWithdrawCount[
            requestAddress
        ];
        uint256 currentTime = block.timestamp;
        if ((_lastWithdraw[requestAddress] + _limitTime) < currentTime) {
            curentLimitWithdraw = amount;
            curentLimitWithdrawTime = 1;
            _lastWithdraw[requestAddress] = currentTime;
        } else {
            curentLimitWithdraw += amount;
            curentLimitWithdrawTime += 1;
        }
        require(curentLimitWithdraw <= _limitWithdraw, "Limit withdraw amount");
        require(
            curentLimitWithdrawTime <= _limitWithdrawTime,
            "Limit rate withdraw time"
        );

        _balances[requestAddress] -= amount;
        (bool success, ) = reveiver.call{value: amount, gas: 30000}("");
        require(success, "Can not withdraw");
        emit Withdraw(requestAddress, amount);
    }

    function transfer(address to, uint256 amount) external payable {
        require(
            amount >= _mintTransactionAmount,
            "Transfer amount less than min transaction amount"
        );
        address requestAddress = msg.sender;
        uint256 balanceOfSender = _balances[requestAddress];
        require(balanceOfSender >= amount, "Invalid transfer amount");
        _balances[requestAddress] -= amount;
        _balances[to] += amount;
        emit Transfer(requestAddress, to, amount);
    }

    event Deposit(address account, uint256 amount);
    event Withdraw(address account, uint256 amount);
    event Transfer(address from, address to, uint256 amount);
}
