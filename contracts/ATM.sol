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
        address owner = msg.sender;
        _balances[owner] = uint96(_totalSupply);
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
        _balances[msg.sender] += amount;
        emit Deposit(msg.sender, amount);
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

    function withdraw() external payable verifyAmount {
        uint256 amount = msg.value;
        address requestAddress = msg.sender;
        uint256 curentLimitWithdraw = _limitWithdrawAmount[requestAddress];
        uint256 curentLimitWithdrawTime = _curentLimitWithdrawCount[
            requestAddress
        ];
        if ((_lastWithdraw[requestAddress] + _limitTime) < block.timestamp) {
            curentLimitWithdraw = amount;
            curentLimitWithdrawTime = 1;
        } else {
            curentLimitWithdraw += amount;
            curentLimitWithdrawTime += 1;
        }
        require(curentLimitWithdraw < _limitWithdraw, "Limit withdraw amount");
        require(
            curentLimitWithdrawTime < _limitWithdrawTime,
            "Limit withdraw time"
        );

        _balances[msg.sender] -= msg.value;
        emit Withdraw(msg.sender, msg.value);
    }

    function transfer(address a, uint256 amount) external payable {
        require(amount >= _mintTransactionAmount, "Transfer amount less than min transaction amount");
        address requestAddress = msg.sender;
        uint256 balanceOfSender = _balances[requestAddress];
        require(balanceOfSender >= amount, "Invalid transfer amount");
        _balances[requestAddress] -= amount;
        _balances[a] += amount;
        emit Transfer(requestAddress, a, amount);
    }

    event Deposit(address account, uint256 amount);
    event Withdraw(address account, uint256 amount);
    event Transfer(address account1, address account2, uint256 amount);
}
