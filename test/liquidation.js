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
            return liquidation.setTokenAddress(tokenAddress, {
                from: accounts[8]
            });
        }).then(function(result) {
            return liquidation.getTokenBalance.call(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.valueOf(), 100000, "100000 tokens was not the first account balance");
        });

    });

    it("3rd account should have 0 tokens", function() {
        var liquidation;
        var standardToken;
        var tokenAddress;
        return Liquidation.deployed().then(function(instance) {
            liquidation = instance;
            return StandardToken.deployed();
        }).then(function(instance) {
            standardToken = instance;
            tokenAddress = standardToken.address;
            return liquidation.setTokenAddress(tokenAddress, {
                from: accounts[8]
            });
        }).then(function(result) {
            return liquidation.getTokenBalance.call(accounts[2]);
        }).then(function(balance) {
            assert.equal(balance.valueOf(), 0, "0 tokens were not the first account balance");
        });
    });


    it("failwithdrawal", function() {
        var liquidation;
        var standardToken;
        var tokenAddress;
        var balance1;
        var balanceContract;
        var tokens = 200000000000000000000000000000000000000000000000000;
        var contractEth1;
        var contractEth2;
        var accountEth1;
        var accountEth2;
        var ac1bal;

        return Liquidation.deployed().then(function(instance) {
            liquidation = instance;
            return StandardToken.deployed();
        }).then(function(instance) {
            standardToken = instance;
            tokenAddress = standardToken.address;
            return liquidation.setTokenAddress(tokenAddress, {
                from: accounts[8]
            });
        }).then(function() {
            return liquidation.getTokenBalance.call(accounts[6]);
        }).then(function(balance) {
            ac1bal = balance;
            return standardToken.approve(liquidation.address, tokens, {
                from: accounts[6]
            });
        }).then(function(result) {
            return liquidation.sendTransaction({
                from: accounts[2],
                value: web3.toWei(10)
            });
        }).then(function(result) {
            contractEth1 = web3.eth.getBalance(liquidation.address).toNumber();
            accountEth1 = web3.eth.getBalance(accounts[6]).toNumber();
            return liquidation.requestWithdrawal(tokens, {
                from: accounts[6]
            });
        }).then(function(result) {
            return liquidation.updatePrice(1.1, {
                from: accounts[8]
            });
        }).then(function(result) {
            return liquidation.withdraw({
                from: accounts[6]
            });
        }).then(function() {
            return liquidation.getTokenBalance.call(accounts[6]);
        }).then(function(balance) {
            balance6 = balance;
            return liquidation.getTokenBalance.call(accounts[8]);
        }).then(function(balance) {
            contractEth2 = web3.eth.getBalance(liquidation.address).toNumber();
            accountEth2 = web3.eth.getBalance(accounts[6]).toNumber();
            balanceContract = balance;
        }).then(function() {
            assert.equal(balance6.valueOf(), ac1bal.valueOf(), "Tokens were not correctly refunded");
            // assert.equal(balanceContract.valueOf(), tokens, tokens + " tokens was not the fund wallet balance");
            // assert.ok(contractEth1 > contractEth2, "ether balance of contract not properly handled");
            // assert.ok(accountEth1 < accountEth2, "ether balance of account not properly handled");
        });
    });


    it("Liquidate tokens from second account", function() {
        var liquidation;
        var standardToken;
        var tokenAddress;
        var balance1;
        var balanceContract;
        var tokens = 778700000000011;
        var contractEth1;
        var contractEth2;
        var accountEth1;
        var accountEth2;
        var ac1bal;

        return Liquidation.deployed().then(function(instance) {
            liquidation = instance;
            return StandardToken.deployed();
        }).then(function(instance) {
            standardToken = instance;
            tokenAddress = standardToken.address;
            return liquidation.setTokenAddress(tokenAddress, {
                from: accounts[8]
            });
        }).then(function() {
            return liquidation.getTokenBalance.call(accounts[1]);
        }).then(function(balance) {
            ac1bal = balance;
            return standardToken.approve(liquidation.address, tokens, {
                from: accounts[1]
            });
        }).then(function(result) {
            return liquidation.sendTransaction({
                from: accounts[2],
                value: web3.toWei(10)
            });
        }).then(function(result) {
            contractEth1 = web3.eth.getBalance(liquidation.address).toNumber();
            accountEth1 = web3.eth.getBalance(accounts[1]).toNumber();
            return liquidation.requestWithdrawal(tokens, {
                from: accounts[1]
            });
        }).then(function(result) {
            return liquidation.updatePrice(1.2, {
                from: accounts[8]
            });
        }).then(function(result) {
            return liquidation.withdraw({
                from: accounts[1]
            });
        }).then(function() {
            return liquidation.getTokenBalance.call(accounts[1]);
        }).then(function(balance) {
            balance1 = balance;
            return liquidation.getTokenBalance.call(accounts[8]);
        }).then(function(balance) {
            contractEth2 = web3.eth.getBalance(liquidation.address).toNumber();
            accountEth2 = web3.eth.getBalance(accounts[1]).toNumber();
            balanceContract = balance;
        }).then(function() {
            assert.equal(balance1.valueOf(), ac1bal.valueOf() - tokens, (ac1bal.valueOf() - tokens) + " tokens was not the first account balance");
            assert.equal(balanceContract.valueOf(), tokens, tokens + " tokens was not the fund wallet balance");
            assert.ok(contractEth1 > contractEth2, "ether balance of contract not properly handled");
            assert.ok(accountEth1 < accountEth2, "ether balance of account not properly handled");
        });
    });


    it("Added and removed liquidity", function() {
        var liquidation;
        var fundWallet = accounts[8];
        var fundWallet2;
        var fundWallet3;

        return Liquidation.deployed().then(function(instance) {
            liquidation = instance;
            return liquidation.sendTransaction({
                from: fundWallet,
                value: web3.toWei(10)
            });
        }).then(function() {
            fundWallet2 = web3.eth.getBalance(fundWallet).toNumber();
            return liquidation.removeLiquidity(web3.toWei(9), {
                from: fundWallet
            });
        }).then(function() {
            return (liquidation.fundWallet());
        }).then(function(wal) {
            //console.log(success);
            fundWallet3 = web3.eth.getBalance(fundWallet).toNumber()
        }).then(function() {
            assert.notEqual(fundWallet2, fundWallet3, "Remove liquidity did not work");
        });
    });

    it("fundWallet can be updated", function() {
        var liquidation;
        var fundWallet = accounts[8];
        var newFundWallet;

        return Liquidation.deployed().then(function(instance) {
            liquidation = instance;
        }).then(function() {
            return liquidation.fundWallet();
        }).then(function(result) {
            return liquidation.changeFundWallet(accounts[7], {
                from: accounts[8]
            });
        }).then(function() {
            return liquidation.fundWallet();
        }).then(function(result) {
            newFundWallet = result;
        }).then(function() {
            assert.notEqual(fundWallet, newFundWallet, "Fund wallet was not updated");
        });
    });
});
