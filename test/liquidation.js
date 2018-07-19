var Liquidation = artifacts.require("./Liquidation.sol");
var StandardToken = artifacts.require("./StandardToken.sol");
var StandardTokenMock = artifacts.require('./helpers/StandardTokenMock.sol');

contract('Liquidation', function(accounts) {

    var tokenAddress;

    it("First account should have 100,000 tokens", function() {
        var liquidation;
        var standardToken;
        var tokenAddress;
        var user1 = accounts[1];

        return Liquidation.deployed().then(function(instance) {
            liquidation = instance;
            return StandardToken.deployed();
        }).then(function(instance) {
            standardToken = instance;
            tokenAddress = standardToken.address;
            return liquidation.TokenInterfaceAddress();
        }).then(function(result) {
            console.log(result.valueOf());
            console.log(tokenAddress);
            // return liquidation.setTokenAddress(tokenAddress, {
            //     from: accounts[8]
            // });
        }).then(function(result) {
            //return liquidation.getTokenBalance.call(accounts[0]);
        }).then(function(balance) {
            //assert.equal(balance.valueOf(), 100000, "100000 tokens was not the first account balance");
        });

    });

    // it("1st account should have 100,000 tokens", function() {
    //     var liquidation;
    //     var standardToken;
    //     var tokenAddress;
    //     return Liquidation.deployed().then(function(instance) {
    //         liquidation = instance;
    //         return StandardToken.deployed();
    //     }).then(function(instance) {
    //         standardToken = instance;
    //         tokenAddress = standardToken.address;
    //         // return liquidation.setTokenAddress(tokenAddress, {
    //         //     from: accounts[8]
    //         // });
    //     }).then(function(result) {
    //         return liquidation.getTokenBalance.call(accounts[0]);
    //     }).then(function(balance) {
    //         assert.equal(balance.valueOf(), 100000, "100000 tokens was not the first account balance");
    //     });
    // });

    it("get tokenBalance of account with 0 tokens", function() {
        var liquidation;
        var standardToken;
        var tokenAddress;
        return Liquidation.deployed().then(function(instance) {
            liquidation = instance;
            return StandardToken.deployed();
        }).then(function(instance) {
            standardToken = instance;
            tokenAddress = standardToken.address;
            // return liquidation.setTokenAddress(tokenAddress, {
            //     from: accounts[8]
            // });
        }).then(function(result) {
            return liquidation.getTokenBalance.call(accounts[2]);
        }).then(function(balance) {
            assert.equal(balance.valueOf(), 0, "0 tokens were not the third account balance");
        });
    });

    it("tests getTokenBalance function of an account with some tokens", function() {
      var liquidation;
      var balance;
      var address = accounts[1]

      return Liquidation.deployed().then(function(instance) {
        liquidation = instance;
      }).then(function() {
        return liquidation.getTokenBalance.call(accounts[1]);
      }).then(function(result) {
        balance = result.valueOf();
        console.log(result.valueOf());
        assert.equal(balance, 2000000000000000000, "didn't work");
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
            // return liquidation.setTokenAddress(tokenAddress, {
            //     from: accounts[8]
            // });
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
            // return liquidation.setTokenAddress(tokenAddress, {
            //     from: accounts[8]
            // });
        }).then(function() {
            return liquidation.getTokenBalance.call(accounts[1]);
        }).then(function(balance) {
            ac1bal = balance;
            return standardToken.approve(liquidation.address, tokens, {
                from: accounts[1]
            });
        }).then(function() {
            return liquidation.getContractAllowance.call(accounts[1]);
        }).then(function(result) {
            console.log(result.toNumber());
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


    it("testing adding to whitelist", async function() {
      var liquidation;
      var controlWallet = accounts[7];
      var whitelistaddress;
      var account;
      var account2;

      return Liquidation.deployed().then(function(instance) {
        liquidation = instance;
      }).then(function() {
        return liquidation.controlWallet();
      });then(function(result) {
        return liquidation.addToWhitelist(controlWallet);
      }).then(function() {
        return liquidation.account();
      }).then(async function(instance) {
        liquidation = instance;
        account = await liquidation.whitelist.call(controlWallet);
        account2 = await liquidation.whitelist.call(accounts[9]);
        console.log(liquidation.whitelist.call(controlWallet));
      }).then(function() {
        assert.notEqual(account, account2, "didn't work :/")
      });
    });

    // it("testing adding several to whitelist", async function() {
    //   var liquidation;
    //   var controlWallet = accounts[7];
    //   var whitelistaddress;
    //   var account;
    //   var account2;
    //   var account3;
    //
    //   return Liquidation.deployed().then(function(instance) {
    //     liquidation = instance;
    //   }).then(function() {
    //     return liquidation.controlWallet();
    //   });then(function(result) {
    //     return liquidation.addMultipleToWhitelist(account, account2, account3);
    //   }).then(function() {
    //     return liquidation.account();
    //   }).then(async function(instance) {
    //     liquidation = instance;
    //     account = await liquidation.whitelist.call(controlWallet);
    //     account2 = await liquidation.whitelist.call(accounts[9]);
    //     account3 = await liquidation.whitelist.call(accounts[8])
    //   }).then(function() {
    //     assert.notEqual(account, account2, "didn't work :/")
    //   });
    // });



    // describe('changing addresses', function() {
    //
    //   beforeEach(function(instance) {
    //     liquidation = instance;
    //     var fundWallet = accounts[8];
    //     var newFundwallet;
    //     var Liquidation =
    //   });
    //   it("fundWallet can be updated", function() {
    //
    //       return Liquidation.deployed().then(function(instance) {
    //           liquidation = instance;
    //       }).then(function() {
    //           return liquidation.fundWallet();
    //       }).then(function(result) {
    //           return liquidation.changeFundWallet(accounts[7], {
    //               from: accounts[8]
    //           });
    //       }).then(function() {
    //           return liquidation.fundWallet();
    //       }).then(function(result) {
    //           newFundWallet = result;
    //       }).then(function() {
    //           assert.notEqual(fundWallet, newFundWallet, "Fund wallet was not updated");
    //       });
    //   });


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

    it("controlWallet can be updated", function() {
        var liquidation;
        var controlWallet = accounts[9];
        var fundWallet = accounts[7];
        var newControlWallet;

        return Liquidation.deployed().then(function(instance) {
            liquidation = instance;
        }).then(function() {
            return liquidation.controlWallet();
        }).then(function(result) {
            return liquidation.changeControlWallet(accounts[5], {
                from: fundWallet
            });
        }).then(function() {
            return liquidation.controlWallet();
        }).then(function(result) {
            newControlWallet = result;
        }).then(function() {
            assert.notEqual(controlWallet, newControlWallet, "Control wallet was not updated");
        });
    });

    it("tests getContractBalance function", function() {
      var liquidation;
      var balance;

      return Liquidation.deployed().then(function(instance) {
        liquidation = instance;
      }).then(function() {
        return liquidation.getContractBalance.call();
      }).then(function(result) {
        balance = result.valueOf();
        console.log(result.valueOf());
        assert.equal(balance, web3.eth.getBalance(liquidation.address).toNumber(), "didn't work");
      });
    });

    describe('claimToken function', function() {

      let erc20Token;

      // beforeEach(async function() {
      //   var fundWallet = accounts[7];
      //   erc20Token = await StandardTokenMock.new(fundWallet, 100);
      //   // create erc20token with 100 tokens
      // });

      it('should allow fundwallet to reclaim random erc20token', async function() {
        var fundWallet = accounts[7];
        var erc20Token = await StandardTokenMock.new(fundWallet, 100);

        return Liquidation.deployed().then(function(instance) {
          liquidation = instance;
        }).then(async function() {
          return erc20Token.transfer(Liquidation.address, 50, {from: accounts[0]});
        }).then(async function() {
          return liquidation.claimTokens(erc20Token.address);
        }).then(async function(fundWalletTokenBal) {
          fundWalletTokenBal = await erc20Token.balanceOf(fundWallet);
          assert.equal(fundWalletTokenBal, 50);
        });
      });


    it("tests claimTokens function", async function() {
      var liquidation;
      var balance;
      var tokens;
      var address = StandardToken.address;
      var fundWallet = accounts[7];
      var requestedForWithdrawal= 0;
      var erc20Token = await StandardTokenMock.new(fundWallet, 100);


      return Liquidation.deployed().then(function(instance) {
        liquidation = instance;
      }).then(function() {
        return erc20Token.transfer(Liquidation.address, 50, {from:accounts[0]});
      }).then(function() {
        return liquidation.getTokenBalance.call(accounts[7]);
      }).then(function(result) {
        balance = result.valueOf();
        console.log(result.valueOf());
        console.log(fundWallet.valueOf());
      }).then(function() {
        return StandardToken.transfer(StandardToken.address , 10000);
      }).then(function() {
        return liquidation.getContractBalance.call();
      }).then(function(balance5) {
        _balance5 = balance5;
        console.log(_balance5);
      }).then(function() {
        return liquidation.claimTokens.call(address, {
          from: fundWallet
          });
      }).then(function() {
        return liquidation.getTokenBalance.call(accounts[7]);
      }).then(function(balance) {
        _balance = balance.valueOf();
        console.log(balance.valueOf());
        assert.equal(_balance, 0, "didn't work ether :/");
      });
    });
});
