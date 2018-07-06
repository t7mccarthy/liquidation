var Liquidation = artifacts.require("./Liquidation.sol");
var StandardToken = artifacts.require("./StandardToken.sol");

contract('Liquidation', function(accounts) {

    var tokenAddress;

    // it("should get balance", function() {
    //     //var liquidation;
    //     var standardToken;
    //     //var tokenAddress;
    //
    //     return StandardToken.deployed().then(function(instance) {
    //         standardToken = instance;
    //         tokenAddress = standardToken.address;
    //         //return liquidation.setTokenAddress(tokenAddress);
    //     }).then(function() {
    //         console.log(tokenAddress)
    //     });
    //
    // });
    // console.log(tokenAddress);

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

    it("Withdraw 10 tokens from second account", function() {
        var liquidation;
        var standardToken;
        var tokenAddress;
        var balance1;
        var balanceContract;

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
            return standardToken.approve(liquidation.address, 10, {from: accounts[1]});
        }).then(function(result) {
            return liquidation.send(web3.toWei(10, "ether"))
        }).then(function(result) {
            return liquidation.requestWithdrawal(10, {from: accounts[1]});
        }).then(function(result) {
            console.log("next problem about to happen!");
            return liquidation.withdraw({from: accounts[1]});
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
            assert.equal(balance1.valueOf(), 199990, "199990 tokens was not the first account balance");
            assert.equal(balanceContract.valueOf(), 10, "10 tokens was not the fund wallet balance");
        });

    });


    // it("should transfer to c20", function() {
    //     return Liquidation.deployed().then(function(instance) {
    //         console.log("Address of contract:");
    //         console.log(instance.address);
    //         return instance.send(web3.toWei(1, "ether")).then(function(result) {}).then(function(result) {
    //             console.log("check1");
    //             return instance.setTokenAddress(tokenAddress);
    //         }).then(function(result) {
    //             console.log("check2");
    //             return instance.removeLiquidity(1, 0x4fa0a3b043659cb39e5f4bdaff6c3bd76fddf1fb); //0x62ACE135F4Be93485306a327b8D826Dd421b9383);
    //         }).then(function(result) {
    //             console.log(result.receipt);
    //             return instance.getTokenBalance.call(0x56c56111F9E7322D9170816a3366781fdf38a0Da);
    //         }).then(function(result) {
    //             console.log("check3");
    //             console.log(result);
    //             assert.equal(result.receipt, 0, "There were C20 tokens in there somehow.");
    //         });
    //     });
    // });
    //
    //
    //
    // it("should get balance of first account", function() {
    //     //var c20add = "0x4fa0a3b043659cb39e5f4bdaff6c3bd76fddf1fb";
    //     return Liquidation.deployed().then(function(instance) {
    //         return instance.setTokenAddress(tokenAddress).then(function() {
    //             return instance.getTokenBalance.call(0x98684fC59F34C36626411f102Be8faCCe8128fdA);
    //         }).then(function(balance) {
    //             console.log("balance check: ")
    //             console.log(balance)
    //             assert.equal(balance.valueOf(), 0, "There were C20 tokens in there somehow.");
    //         });
    //     });
    // });
    //
    //
    // it("should transfer ether", function() {
    //     //var c20coin = C20.at("0x4fa0a3b043659cb39e5f4bdaff6c3bd76fddf1fb");
    //     //var c20add = "0x4fa0a3b043659cb39e5f4bdaff6c3bd76fddf1fb";
    //     return Liquidation.deployed().then(function(instance) {
    //         return instance.send(web3.toWei(1, "ether")).then(function(result) {
    //             console.log("check1");
    //             console.log("liquidation balance 1:");
    //             console.log(web3.eth.getBalance(instance.address).toNumber());
    //             console.log("c20 contract balance 1:");
    //             console.log(web3.eth.getBalance(tokenAddress).toNumber());
    //             //console.log(DeployedAddresses.C20());
    //             return instance.setTokenAddress(tokenAddress);
    //         }).then(function(result) {
    //             console.log("check2");
    //             return web3.eth.sendTransaction({
    //                 from: accounts[3],
    //                 to: tokenAddress,
    //                 value: web3.toWei(0.05, "ether")
    //             });
    //         }).then(function() {
    //             console.log("liquidation balance 2:");
    //             console.log(web3.eth.getBalance(instance.address).toNumber());
    //             console.log("c20 contract balance 2:");
    //             console.log(web3.eth.getBalance(tokenAddress).toNumber());
    //             assert.equal(balance, true, "Didn't work but close.");
    //         });
    //     });
    // });
    //
    // it("should transfer a different way", function() {
    //
    //     //var c20add = "0x4fa0a3b043659cb39e5f4bdaff6c3bd76fddf1fb";
    //
    //     return Liquidation.deployed().then(function(instance) {
    //         console.log("Address of contract:");
    //         console.log(instance.address);
    //         return instance.send(web3.toWei(1, "ether")).then(function(result) {}).then(function(result) {
    //             console.log("liquidation balance 1:");
    //             console.log(web3.eth.getBalance(instance.address).toNumber());
    //             console.log("c20 contract balance 1:");
    //             console.log(web3.eth.getBalance(tokenAddress).toNumber());
    //             console.log("check1");
    //             return instance.setTokenAddress(tokenAddress); //0x62ACE135F4Be93485306a327b8D826Dd421b9383);
    //         }).then(function(result) {
    //             console.log("check2");
    //             return instance.removeLiquidity(1, tokenAddress); //0x62ACE135F4Be93485306a327b8D826Dd421b9383);
    //         }).then(function() {
    //             //console.log(result.receipt);
    //             console.log("liquidation balance 2:");
    //             console.log(web3.eth.getBalance(instance.address).toNumber());
    //             console.log("c20 contract balance 2:");
    //             console.log(web3.eth.getBalance(tokenAddress).toNumber());
    //             return instance.getTokenBalance.call(account[5]);
    //         }).then(function(result) {
    //             console.log("check3");
    //             console.log(result);
    //             assert.equal(result.receipt, 0, "There were C20 tokens in there somehow.");
    //         });
    //     });
    // });

});
