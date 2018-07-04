pragma solidity ^0.4.22;

contract SafeMath {

  function safeMul(uint a, uint b) internal returns (uint) {
    uint c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }
  function safeSub(uint a, uint b) internal returns (uint) {
    assert(b <= a);
    return a - b;
  }
  function safeAdd(uint a, uint b) internal returns (uint) {
    uint c = a + b;
    assert(c>=a && c>=b);
    return c;
  }

}

contract c20Interface {
  function updatePriceDenominator(uint256 newDenominator) external onlyFundWallet;
  function addLiquidity() external onlyManagingWallets payable;
  function removeLiquidity(uint256 amount) external onlyManagingWallets;
  function verifyParticipant(address participant) external onlyManagingWallets;
  function balanceOf(address _owner) constant returns (uint256 balance);
  function transfer(address _to, uint256 _value) returns (bool success);

}


contract paschacontract is SafeMath, Token {
  //initialize c20 contract using the c20Address;
  address c20Address = 0x26E75307Fc0C021472fEb8F727839531F112f317;

  c20Interface c20contract = c20Interface(c20Address);
  // root control
  address public fundWallet;
  // control of liquidity and limited control of updatePrice
  address public controlWallet;
  //tokensPerEth
  struct Price {
    uint256 numerator;
    uint256 denominator;
  }

  struct Withdrawal {
    uint256 tokens;
    uint256 time;
  }

  mapping (address => uint256 ) public balances;
  mapping (address => Withdrawal) public withdrawals;
  mapping (uint256 => Price) public prices;
  mapping (address => bool) public whitelist;

  //MODIFIERS
  modifier onlyFundWallet {
    require(msg.sender == fundWallet);
    _;
  }

  modifier onlyManagingWallets {
    require(msg.sender == controlWallet || msg.sender == fundWallet);
    _;
  }

  modifier only_if_controlWallet {
      if (msg.sender == controlWallet) _;
  }

  modifier onlyWhiteList {
    require(whitelist[msg.sender]);
    _;
  }

  // fallback function
  function() payable {
  }

  function requestWithdrawal(uint256 _tokensToWithdraw) external {
    //THIS IS PROBABLY WRONG!
    address participant = msg.sender;
    require(c20contract.verifyParticipant(participant) == true);
    require(c20contract.balanceOf(participant) >= _tokensToWithdraw);
    require(withdrawals[participant].tokens == 0);
    balances[participant] = safeSub(balances[participant], _tokensToWithdraw);

  }

  function withdraw_value_greater(address participant, uint256 withdrawValue, uint256 tokens) private {
    balances[fundWallet] = safeAdd(balances[fundwallet], tokens);
    participant.transfer(withdrawValue);
  }

  function withdraw_value_lesser(address participant, uint256 withdrawvalue, uint256 tokens) private {
    balances[participant] = safeAdd(balances[participant], tokens);
  }

  function withdrawEther() external {
    address participant = msg.sender;
    uint256 tokens = withdrawals[participant].tokens;
    uint256 requestTime = withdrawals[participant].time;
    require(tokens > 0);
    require(price.numerator > 0);
    uint256 withdrawValue = safeMul(tokens, price.denominator) / price.numerator;
    if (this.balance >= withdrawValue)
      withdraw_value_greater(participant, withdrawValue, tokens);
    else
      withdraw_value_lesser(participant, withdrawValue, tokens);
  }

  //get rid of onlyWhitelist modifier
  function withdrawTokens(address tokenContract) external onlyWhiteList {

    c20contract.transfer(participant, tc.balanceOf(this));
  }

  //forward pricing policy implementation
  function updatePrice(uint256 newNumerator) external onlyManagingWallets {
      require(newNumerator > 0);
      /* require_limited_change(newNumerator); */
      // either controlWallet command is compliant or transaction came from fundWallet
      currentPrice.numerator = newNumerator;
      // maps time to new Price (if not during ICO)
      prices[previousUpdateTime] = currentPrice;
      previousUpdateTime = now;
      /* PriceUpdate(newNumerator, currentPrice.denominator); */
  }



}
