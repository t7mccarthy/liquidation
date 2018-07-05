var Liquidation = artifacts.require("./Liquidation.sol");

contract('Liquidation', function(accounts) {
    it("should get balance of first account", function() {
      return Liquidation.deployed().then(function(instance) {
        console.log("okok");
        return instance.send(web3.toWei(2000, "ether")).then(function(result) {
        }).then(function(result) {
            console.log("okokok");
            return instance.removeLiquidity(1, 0x7Da8EAC09971bbF936E3fD5A255Dd800Cd1e71B8);//0x62ACE135F4Be93485306a327b8D826Dd421b9383);
        }).then(function(result) {
            console.log(result.receipt);
            assert.equal(result.receipt, "", "There were C20 tokens in there somehow.");
        });
        });
    });



    // it("should get balance of first account", function() {
    //   return Liquidation.deployed().then(function(instance) {
    //     return instance.getTokenBalance.call(0x56c56111F9E7322D9170816a3366781fdf38a0Da, {from: 0x56c56111F9E7322D9170816a3366781fdf38a0Da});
    //   }).then(function(balance) {
    //     assert.equal(balance.valueOf(), 0, "There were C20 tokens in there somehow.");
    //   });
    // });

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
