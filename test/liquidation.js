var Liquidation = artifacts.require("./Liquidation.sol");
var BasicToken = artifacts.require("./BasicToken.sol");


contract('Liquidation', function(accounts) {
    it("should transfer to c20", function() {
      return Liquidation.deployed().then(function(instance) {
        console.log("Address of contract:");
        console.log(instance.address);
        return instance.send(web3.toWei(1, "ether")).then(function(result) {
        }).then(function(result) {
            console.log("check1");
            return instance.setC20Address(0x4fa0a3b043659cb39e5f4bdaff6c3bd76fddf1fb);//0x62ACE135F4Be93485306a327b8D826Dd421b9383);
        }).then(function(result) {
            console.log("check2");
            return instance.removeLiquidity(1, 0x4fa0a3b043659cb39e5f4bdaff6c3bd76fddf1fb);//0x62ACE135F4Be93485306a327b8D826Dd421b9383);
        }).then(function(result) {
            console.log(result.receipt);
            return instance.getTokenBalance.call(0x56c56111F9E7322D9170816a3366781fdf38a0Da);
        }).then(function(result) {
            console.log("check3");
            console.log(result);
            assert.equal(result.receipt, 0, "There were C20 tokens in there somehow.");
        });
        });
    });



    it("should get balance of first account", function() {
      var c20add = "0x4fa0a3b043659cb39e5f4bdaff6c3bd76fddf1fb";
      return Liquidation.deployed().then(function(instance) {
        return instance.setC20Address("0x4fa0a3b043659cb39e5f4bdaff6c3bd76fddf1fb").then(function() {
        return instance.getTokenBalance.call(0x98684fC59F34C36626411f102Be8faCCe8128fdA);
      }).then(function(balance) {
        console.log("balance check: ")
        console.log(balance)
        assert.equal(balance.valueOf(), 0, "There were C20 tokens in there somehow.");
      });
    });
});




    it("should transfer ether", function() {
    //var c20coin = C20.at("0x4fa0a3b043659cb39e5f4bdaff6c3bd76fddf1fb");
    var c20add = "0x4fa0a3b043659cb39e5f4bdaff6c3bd76fddf1fb";
      return Liquidation.deployed().then(function(instance) {
        return instance.send(web3.toWei(1, "ether")).then(function(result) {
            console.log("check1");
            console.log("liquidation balance 1:");
            console.log(web3.eth.getBalance(instance.address).toNumber());
            console.log("c20 contract balance 1:");
            console.log(web3.eth.getBalance(c20add).toNumber());
            //console.log(DeployedAddresses.C20());
            return instance.setC20Address("0x4fa0a3b043659cb39e5f4bdaff6c3bd76fddf1fb");//0x62ACE135F4Be93485306a327b8D826Dd421b9383);
        }).then(function(result) {
            console.log("check2");
        return web3.eth.sendTransaction({from: accounts[3],to: c20add, value:web3.toWei(0.05, "ether")});
    }).then(function() {
          console.log("liquidation balance 2:");
          console.log(web3.eth.getBalance(instance.address).toNumber());
          console.log("c20 contract balance 2:");
          console.log(web3.eth.getBalance(c20add).toNumber());
        assert.equal(balance, true, "Didn't work but close.");
      });
    });
    });

    it("should transfer a different way", function() {

        var c20add = "0x4fa0a3b043659cb39e5f4bdaff6c3bd76fddf1fb";

      return Liquidation.deployed().then(function(instance) {
        console.log("Address of contract:");
        console.log(instance.address);
        return instance.send(web3.toWei(1, "ether")).then(function(result) {
        }).then(function(result) {
            console.log("liquidation balance 1:");
            console.log(web3.eth.getBalance(instance.address).toNumber());
            console.log("c20 contract balance 1:");
            console.log(web3.eth.getBalance(c20add).toNumber());
            console.log("check1");
            return instance.setC20Address(c20add);//0x62ACE135F4Be93485306a327b8D826Dd421b9383);
        }).then(function(result) {
            console.log("check2");
            return instance.removeLiquidity(1, c20add);//0x62ACE135F4Be93485306a327b8D826Dd421b9383);
        }).then(function() {
            //console.log(result.receipt);
            console.log("liquidation balance 2:");
            console.log(web3.eth.getBalance(instance.address).toNumber());
            console.log("c20 contract balance 2:");
            console.log(web3.eth.getBalance(c20add).toNumber());
            return instance.getTokenBalance.call(account[5]);
        }).then(function(result) {
            console.log("check3");
            console.log(result);
            assert.equal(result.receipt, 0, "There were C20 tokens in there somehow.");
        });
        });
    });

    it("should get balance of first account", function() {
      var c20add = "0x4fa0a3b043659cb39e5f4bdaff6c3bd76fddf1fb";
      return Liquidation.deployed().then(function(instance) {
        return instance.setC20Address("0x4fa0a3b043659cb39e5f4bdaff6c3bd76fddf1fb").then(function() {
        return instance.getTokenBalance.call(0x98684fC59F34C36626411f102Be8faCCe8128fdA);
      }).then(function(balance) {
        console.log("balance check: ")
        console.log(balance)
        assert.equal(balance.valueOf(), 100, "There were C20 tokens in there somehow.");
      });
    });
    // it("should withdraw coin correctly", function() {
    //     var liquid;
    //
    //     // Get initial balances of first and second account.
    //     var account_one = accounts[0];
    //     var account_two = accounts[1];
    //     var fundWallet = accounts[8];
    //
    //     var account_one_starting_balance;
    //     var account_two_starting_balance;
    //     var liquid_starting_balance;
    //     var account_one_ending_balance;
    //     var account_two_ending_balance;
    //     var liquid_ending_balance;
    //
    //     var amount = 10;
    //     var transfer_to = 40;
    //
    //     return Liquidation.deployed().then(function(instance) {
    //       liquid = instance;
    //       return liquid.balanceOf.call(account_two);
    //     }).then(function(balance) {
    //       account_two_starting_balance = balance.toNumber();
    //        return liquid.balanceOf.call(liquid.address);
    //     }).then(function(balance) {
    //        liquid_starting_balance = balance.toNumber();
    //       return liquid.addLiquidity({ value: 4000, from: fundWallet });
    //     }).then(function() {
    //       return liquid.requestWithdrawal(amount, { from: account_two });
    //     }).then(function() {
    //       return liquid.withdraw({ from: account_two });
    //     }).then(function() {
    //       return liquid.balanceOf.call(account_two);
    //     }).then(function(balance) {
    //       account_two_ending_balance = balance.toNumber();
    //       return liquid.balanceOf.call(liquid.address);
    //     }).then(function(balance) {
    //       liquid_ending_balance = balance.toNumber();
    //
    //       assert.equal(account_two_ending_balance, account_two_starting_balance - amount, "Amount wasn't correctly taken from the sender");
    //       assert.equal(liquid_ending_balance, liquid_starting_balance + amount, "Amount wasn't correctly sent to the liquidity contract");
    //     });
    // });

});
