// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

//import "hardhat/console.sol";

contract Assessment {
    address payable public owner;
    uint256 public balance;
    uint256 public transactionFee = 10; // Fee in percentage (e.g., 10 means 10%)



    mapping(address => uint256) public balanceOf;
    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event TransactionFeeUpdated(uint256 newFee);
    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor(uint initBalance) payable { 
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function getTransaction() public view returns (uint256) {
        return transactionFee;
    }


    function updateTransactionFee(uint256 newFee) public {
    require(msg.sender == owner, "Only the owner of this account can update the transaction fee");
    require(newFee <= 100, "Fee cannot exceed 100%");
    
    uint256 oldFee = transactionFee;
    transactionFee = newFee;

    emit TransactionFeeUpdated(oldFee, newFee);
}
    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        uint newWithdraw =_withdrawAmount + transactionFee;
        if (balance < newWithdraw) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: newWithdraw
            });
        }
       
        // withdraw the given amount
        balance -= newWithdraw;

        // assert the balance is correct
        assert(balance == (_previousBalance - newWithdraw));

        // emit the event
        emit Withdraw(newWithdraw);
    }
}
