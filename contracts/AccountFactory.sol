// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import "./SimpleAccount.sol";

contract AccountFactory {
    // Stores the implementation contract for SimpleAccount
    SimpleAccount public immutable accountImplementation;

    // Mapping to track balances for accounts
    mapping(address => uint) balances;

    // Constructor initializing the accountImplementation contract
    constructor(IEntryPoint _entryPoint) {
        accountImplementation = new SimpleAccount(_entryPoint);
    }

    // Creates an account and returns its address, even if the account is already deployed
    function createAccount(
        address owner,
        uint256 salt
    ) public returns (SimpleAccount ret) {
        address addr = getTheAddress(owner, salt);
        uint codeSize = addr.code.length;
        if (codeSize > 0) {
            return SimpleAccount(payable(addr));
        }
        ret = SimpleAccount(
            payable(
                new ERC1967Proxy{salt: bytes32(salt)}(
                    address(accountImplementation),
                    abi.encodeCall(SimpleAccount.initialize, (owner))
                )
            )
        );
    }

    // Calculates the counterfactual address of the account as it would be returned by createAccount()
    function getTheAddress(
        address owner,
        uint256 salt
    ) public view returns (address) {
        return
            Create2.computeAddress(
                bytes32(salt),
                keccak256(
                    abi.encodePacked(
                        type(ERC1967Proxy).creationCode,
                        abi.encode(
                            address(accountImplementation),
                            abi.encodeCall(SimpleAccount.initialize, (owner))
                        )
                    )
                )
            );
    }

    // Adds funds to an account
    function addFunds(address account, uint amount) public payable {
        require(account != address(0), "bad address");
        require(amount > 0, "Amount must be greater than 0");
        balances[account] += amount;
    }

    // Retrieves the balance of a user's account
    function getBalance(address user) public view returns (uint256) {
        require(user != address(0), "bad address");
        return balances[user];
    }
}
