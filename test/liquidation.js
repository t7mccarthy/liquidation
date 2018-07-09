var Liquidation = artifacts.require("./Liquidation.sol");
var StandardToken = artifacts.require("./StandardToken.sol");

contract('Liquidation', function(accounts) {

    var tokenAddress;

    it("First account should have 100,000 tokens", function() {
        var liquidation;
        var standardToken;
        var tokenAddress;

        return Liquidation.deployed().then(function(instance) {
            liquidation = instance;
            return StandardToken.deployed();
        }).then(function(instance) {
            standardToken = instance;
            tokenAddress = standardToken.address;
            return liquidation.setTokenAddress(tokenAddress);
        }).then(function(result) {
            return liquidation.getTokenBalance.call(accounts[0]);
        }).then(function(balance) {
            console.log("balance check: ")
            console.log(balance)
            assert.equal(balance.valueOf(), 100000, "100000 tokens was not the first account balance");
        });

    });

    it("Liquidate tokens from second account", function() {
        var liquidation;
        var standardToken;
        var tokenAddress;
        var balance1;
        var balanceContract;
        var tokens = 100;

        return Liquidation.deployed().then(function(instance) {
            liquidation = instance;
            return StandardToken.deployed();
        }).then(function(instance) {
            standardToken = instance;
            tokenAddress = standardToken.address;
            return liquidation.setTokenAddress(tokenAddress);
        }).then(function() {
            return liquidation.getTokenBalance.call(accounts[1]);
        }).then(function(balance) {
            console.log("balance check account 1: ")
            console.log(balance)
            console.log("problem about to happen!");
            return standardToken.approve(liquidation.address, tokens, {
                from: accounts[1]
            });
        }).then(function(result) {
            return liquidation.sendTransaction({from: accounts[2], value: web3.toWei(10)});
        }).then(function(result) {
            return liquidation.requestWithdrawal(tokens, {
                from: accounts[1]
            });
        }).then(function(result) {
            console.log("next problem about to happen!");
            return liquidation.withdraw({
                from: accounts[1]
            });
        }).then(function(check) {
            return liquidation.getTokenBalance.call(accounts[1]);
        }).then(function(balance) {
            console.log("balance check account 1: ")
            console.log(balance)
            balance1 = balance;
            return liquidation.getTokenBalance.call(0x4C766Be30D07720146e9bEe43599f6871241b09e);
        }).then(function(balance) {
            console.log("balance check fund wallet: ")
            console.log(balance)
            console.log("Contract eth:");
            console.log(web3.eth.getBalance(liquidation.address).toNumber());
            console.log("Account 1 eth:");
            console.log(web3.eth.getBalance(accounts[1]).toNumber());
            balanceContract = balance;
        }).then(function() {
            assert.equal(balance1.valueOf(), 200000 - tokens, (200000 - tokens) + " tokens was not the first account balance");
            assert.equal(balanceContract.valueOf(), tokens, tokens + " tokens was not the fund wallet balance");
        });
    });


    it("Added and removed liquidity", function() {
        var liquidation;
        var fundWallet = accounts[8];

        return Liquidation.deployed().then(function(instance) {
            liquidation = instance;
            console.log("Contract Ether Balance 1:");
            console.log(web3.eth.getBalance(liquidation.address).toNumber());
            console.log("Fund Wallet Ether Balance 1:");
            console.log(web3.eth.getBalance(fundWallet).toNumber());
            return liquidation.sendTransaction({from: fundWallet, value: web3.toWei(10)});
        }).then(function(result) {
            console.log("Contract Ether Balance 2:");
            console.log(web3.eth.getBalance(liquidation.address).toNumber());
            console.log("Fund Wallet Ether Balance 2:");
            console.log(web3.eth.getBalance(fundWallet).toNumber());
            return liquidation.removeLiquidity(10, {from: });
        }).then(function(result) {
            console.log("Contract Ether Balance 3:");
            console.log(web3.eth.getBalance(liquidation.address).toNumber());
            console.log("Fund Wallet Ether Balance 3:");
            console.log(web3.eth.getBalance(fundWallet).toNumber());

        });
    });
});
