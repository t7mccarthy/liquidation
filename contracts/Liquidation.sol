pragma solidity ^0.4.22;


/// @title A contract used to prevent uint overflow issues when performing mathematical operations
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


contract TokenInterface {
  function balanceOf(address _owner) public view returns (uint256 balance);
  function transfer(address _to, uint256 _value) public returns (bool);
  function transferFrom(address from, address to, uint256 value) public returns (bool);
}


/// @title ERC20 liquidation contract
/// @author Tom McCarthy
/// @notice Liquidates C20 tokens held by participants in the Cryto20 fund
contract Liquidation is SafeMath {
    //using SafeMath for uint256;

    // Address of token contract
    address public TokenInterfaceAddress;
    TokenInterface public tokenContract;

    // PUBLIC VARIABLES:
    /// @dev Managing wallets of token contract
    address public fundWallet;
    address public controlWallet;

    // TODO: implement wait time for price updates
    bool public halted = false;
    uint public previousUpdateTime;
    uint public wait = 5 hours;
    Price public currentPrice;

    // STRUCTS:
    /// @dev Price of token (tokens per ether)
    struct Price {
        uint numerator;
        uint denominator;
    }

    /// @dev Amount tokens to withdraw, previous update time when request made
    struct Withdrawal {
        uint tokens;
        uint time;
    }

    // MAPPINGS:
    /// @dev Previous update time mapped to most recently retrieved price
    mapping (uint256 => Price) public prices;

    /// @dev Address mapped to withdrawal
    mapping (address => Withdrawal) public withdrawals;

    //EVENTS:
    event RemoveLiquidity(uint256 ethAmount);
    event WithdrawRequest(address indexed participant, uint256 amountTokens);
    event Withdraw(address indexed participant, uint256 amountTokens, uint256 etherAmount);
    event PriceUpdate(uint256 numerator, uint256 denominator);

    //MODIFIERS:
    modifier onlyFundWallet {
        require(msg.sender == fundWallet);
        _;
    }

    modifier onlyManagingWallets {
        require(msg.sender == controlWallet || msg.sender == fundWallet);
        _;
    }

    modifier notHalted {
        require(!halted);
        _;
    }

    modifier waited {
        require(now >= safeAdd(previousUpdateTime, wait));
        _;
    }

    modifier onlyIncrease (uint _newNumerator){
        require(_newNumerator > currentPrice.numerator);
        _;
    }

    modifier limitedChange (uint _newNumerator){
        require((safeSub(_newNumerator, currentPrice.numerator) / currentPrice.numerator) <= 20);
        _;
    }

    // CONSTRUCTOR:
    constructor(address fundWalletInput, address controlWalletInput, uint priceNumeratorInput, address tokenAddress) public {
        require(fundWalletInput != address(0));
        require(controlWalletInput != address(0));
        require(priceNumeratorInput > 0);
        fundWallet = fundWalletInput;
        controlWallet = controlWalletInput;
        currentPrice = Price(priceNumeratorInput, 1000);
        previousUpdateTime = 0;
        prices[previousUpdateTime] = currentPrice;
        previousUpdateTime = now;
        TokenInterfaceAddress = tokenAddress;
    }


    // FUNCTIONS:
    /// @notice Fallback function allowing contract to accept ether
    function () public payable {}

    /// @notice Updates number of C20 tokens per set amount of ether
    /// @dev Current update time is not mapped to current price in order to maintain forward pricing policy
    function updatePrice(uint _newNumerator)
        external
        onlyManagingWallets
        //waited
        onlyIncrease(_newNumerator)
        limitedChange(_newNumerator)
    {
        require(_newNumerator > 0);
        // Update numerator of currentPrice
        currentPrice.numerator = _newNumerator;
        // Map previous update time to updated price
        prices[previousUpdateTime] = currentPrice;
        // Update previousUpdateTime
        previousUpdateTime = now;
        PriceUpdate(_newNumerator, currentPrice.denominator);
    }

    /// @notice Updates set amount of ether in measure of C20 tokens per set amount of ether
    /// @dev Not updated frequently like numerator; used in circumstances where order of magnitude of price changes
    function updatePriceDenominator(uint _newDenominator) external onlyFundWallet {
        require(_newDenominator > 0);
        // Update denominator of currentPrice
        currentPrice.denominator = _newDenominator;
        // Map previous update time to updated price
        prices[previousUpdateTime] = currentPrice;
        // Update previousUpdateTime
        previousUpdateTime = now;
    }

    /// @notice Gets token balance of participant from token contract
    function getTokenBalance(address _participant) public view returns (uint balance) {
        return tokenContract.balanceOf(_participant);
    }

    /// @notice Allows user to request a certain amount of tokens to liquidate
    function requestWithdrawal(uint _tokensToWithdraw) external notHalted {//onlyWhitelist {
        require(_tokensToWithdraw > 0);
        require(getTokenBalance(msg.sender) >= _tokensToWithdraw);
        // No outstanding withdrawals can exist
        require(withdrawals[msg.sender].tokens == 0);

        tokenContract.transferFrom(msg.sender, this, _tokensToWithdraw);
        // Store requested withdrawal in withdrawal mapping
        withdrawals[msg.sender] = Withdrawal({tokens: _tokensToWithdraw, time: previousUpdateTime});
        emit WithdrawRequest(msg.sender, _tokensToWithdraw);
    }

    /// @notice Called by user after requesting withdrawal to carry out withdrawal
    function withdraw() external notHalted {//onlyWhitelist {
        uint tokens = withdrawals[msg.sender].tokens;
        // Withdrawal must have been requested
        require(tokens > 0);
        // previousUpdateTime when request was made
        uint requestTime = withdrawals[msg.sender].time;
        // Next price that was set after the request (maintaining forward pricing policy)
        Price storage priceAfterRequest = prices[requestTime];
        // Price must have been set after requestTime
        require(priceAfterRequest.numerator > 0);
        // Convert number of tokens in liquidation request to ether
        uint256 ethValue = safeMul(tokens, priceAfterRequest.denominator) / priceAfterRequest.numerator;
        // Reset mapping storing requested withdrawals
        withdrawals[msg.sender].tokens = 0;

        // If liquidation contract has enough ether in balance to perform liquidation transaction
        if (address(this).balance >= ethValue) { //this.balance
            // Perform liquidation transaction
            doWithdrawal(msg.sender, ethValue, tokens);
        }
        else {
            // Refund tokens to participant
            failWithdrawal(msg.sender, ethValue, tokens);
        }
    }

    /// @notice Add tokens to fund wallet, transfer correstponding ether to participant
    function doWithdrawal(address _participant, uint _ethValue, uint _tokens) private{
        assert(address(this).balance >= _ethValue); //this.balance
        // Add transfer tokens from msg.sender to fundWallet
        tokenContract.transfer(fundWallet, _tokens);
        // Transfer ether from contract to participant
        _participant.transfer(_ethValue);
        emit Withdraw(_participant, _tokens, _ethValue);
    }

    /// @notice Refund tokens to participant, indicate failed transaction
    function failWithdrawal(address _participant, uint _ethValue, uint _tokens) private {
        assert(address(this).balance < _ethValue); //this.balance
        // Refund tokens to participant
        tokenContract.transfer(_participant, _tokens);
        emit Withdraw(_participant, _tokens, 0);
    }

    /// @notice Managing wallets can transfer ether from contract to fund wallet
    function removeLiquidity(uint _amount) external onlyManagingWallets notHalted {
        //require(_amount <= address(this).balance); //this.balance
        fundWallet.transfer(_amount);
        emit RemoveLiquidity(_amount);
    }

    function changeFundWallet(address _newFundWallet) external onlyFundWallet {
        require(_newFundWallet != address(0));
        fundWallet = _newFundWallet;
    }

    function changeControlWallet(address _newControlWallet) external onlyFundWallet {
        require(_newControlWallet != address(0));
        controlWallet = _newControlWallet;
    }

    function changeWait(uint256 _newWait) external onlyFundWallet {
        wait = _newWait;
    }

    function setTokenAddress(address _tokenadd) public onlyFundWallet {
        TokenInterfaceAddress = _tokenadd;
        tokenContract = TokenInterface(TokenInterfaceAddress);
    }

    /// @notice Fund wallet can stop liquidation transactions from occurring
    function halt() external onlyFundWallet {
        halted = true;
    }

    /// @notice Fund wallet can allow liquidation transactions to occur again
    function unhalt() external onlyFundWallet {
        halted = false;
    }

}
