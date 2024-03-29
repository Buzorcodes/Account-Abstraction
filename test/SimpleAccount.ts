import { expect } from "chai";
import { ethers } from "hardhat";

let simpleAccountFactory;
let simpleAccount;
let deployer;
let user1;
let user2;
const amount = ethers.utils.parseEther("1");

describe("SimpleAccountFactory", function () {
  before(async function () {
    // Get signers
    [deployer, user1, user2] = await ethers.getSigners();

    // Deploy SimpleAccountFactory
    const simpleAccountFactory = await ethers.deployContract("SimpleAccountFactory");
    await simpleAccountFactory.waitForDeployment();
  });

  it("create a new account", async function () {
    // Create a new account
    const salt = 123;
    const createAccountTx = await simpleAccountFactory.createAccount(user1.address, salt);
    const createAccountReceipt = await createAccountTx.wait();
    expect(createAccountReceipt.status).to.equal(1);

    // Get the created account address
    const createdAccountAddress = await simpleAccountFactory.getCreatedAddress(user1.address, salt);

    // Retrieve the created account contract
    simpleAccount = await ethers.getContractAt("SimpleAccount", createdAccountAddress);

    // Verify the account owner
    const accountOwner = await simpleAccount.owner();
    expect(accountOwner).to.equal(user1.address);
  });

  it("funds a wallet", async function () {
    const initialBalance = await simpleAccountFactory.balanceOf(user1.address);

    // Add funds to the wallet
    await simpleAccountFactory.fundWallet(user1.address, { value: amount });

    // Verify the balance
    const updatedBalance = await simpleAccountFactory.balanceOf(user1.address);
    expect(updatedBalance.toString()).to.equal(amount.toString());
  }); 

  it("get return the balance of a wallet", async function () {
    const balance = await simpleAccountFactory.balanceOf(user1.address);
    expect(balance.toString()).to.equal(amount);
  });

  it("create a new account", async function () {
    // Create a new account
    const salt = 123;
    const createAccountTx = await simpleAccountFactory.createAccount(user1.address, salt);
    const createAccountReceipt = await createAccountTx.wait();
    expect(createAccountReceipt.status).to.equal(1);

    // Get the created account address
    const createdAccountAddress = await simpleAccountFactory.getCreatedAddress(user1.address, salt);

    // Retrieve the created account contract
    simpleAccount = await ethers.getContractAt("SimpleAccount", createdAccountAddress);

    // Verify the account owner
    const accountOwner = await simpleAccount.owner();
    expect(accountOwner).to.equal(user1.address);
  });
});
