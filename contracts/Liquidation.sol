pragma solidity ^0.4.22;


/// @title A contract used to prevent uint overflow issues when performing mathematical operations
contract SafeMath {
    function safeMul(uint a, uint b) internal pure returns (uint) {
        uint c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }
    function safeSub(uint a, uint b) internal pure returns (uint) {
        assert(b <= a);
        return a - b;
    }
    function safeAdd(uint a, uint b) internal pure returns (uint) {
        uint c = a + b;
        assert(c>=a && c>=b);
        return c;
    }
}


contract C20Interface {
  function balanceOf(address _owner) public constant returns (uint);
  function transfer(address _to, uint256 _value) public returns (bool success);
  mapping (address => bool) public whitelist;
  //function verifyParticipant(address participant) external;
}


/// @title C20 liquidation contract
/// @author Tom McCarthy
/// @notice Liquidates C20 tokens held by participants in the Cryto20 fund
contract Liquidation is SafeMath {
    // Address of C20 contract on ethereum
    address C20InterfaceAddress = 0x26E75307Fc0C021472fEb8F727839531F112f317;
    C20Interface c20Contract = C20Interface(C20InterfaceAddress);

    // PUBLIC VARIABLES:
    /// @dev Managing wallets from C20 contract
    address public fundWallet;
    address public controlWallet;

    // TODO: implement wait time for price updates
    bool public halted = false;
    uint public previousUpdateTime;
    Price public currentPrice;

    // STRUCTS:
    /// @dev Price of C20 (tokens per ether)
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

    //MODIFIERS:
    // TODO: create modifiers
    modifier onlyWhitelist {
      require(c20Contract.whitelist(msg.sender));
      _;
    }

    // EVENTS:
    // TODO: create events for functions to communicate with front-end

    // CONSTRUCTOR:
    constructor(address fundWalletInput, address controlWalletInput, uint priceNumeratorInput) public {
        require(fundWalletInput != address(0));
        require(controlWalletInput != address(0));
        require(priceNumeratorInput > 0);
        fundWallet = fundWalletInput;
        controlWallet = controlWalletInput;
        currentPrice = Price(priceNumeratorInput, 1000);
        previousUpdateTime = now;
    }

    // FUNCTIONS:
    /// @notice Fallback function allowing contract to accept ether
    function () public payable {}

    /// @notice Updates number of C20 tokens per set amount of ether
    /// @dev Current update time is not mapped to current price in order to maintain forward pricing policy
    function updatePrice(uint _newNumerator) external {
        require(_newNumerator > 0);
        // TODO: require(limited_change(_newNumerator));
        // Update numerator of currentPrice
        currentPrice.numerator = _newNumerator;
        // Map previous update time to updated price
        prices[previousUpdateTime] = currentPrice;
        // Update previousUpdateTime
        previousUpdateTime = now;
    }

    /// @notice Updates set amount of ether in measure of C20 tokens per set amount of ether
    /// @dev Not updated frequently like numerator; used in circumstances where order of magnitude of price changes
    function updatePriceDenominator(uint _newDenominator) external {
        require(_newDenominator > 0);
        // Update denominator of currentPrice
        currentPrice.denominator = _newDenominator;
        // Map previous update time to updated price
        prices[previousUpdateTime] = currentPrice;
        // Update previousUpdateTime
        previousUpdateTime = now;
    }

    /// @notice Gets C20 token balance of participant from C20 contract
    function balanceOf(address _participant) private view returns (uint balance) {
        // TODO: Get balance from balanceOf function in C20 contract
        return c20Contract.balanceOf(_participant);
    }

    /// @notice Allows user to request a certain amount of tokens to liquidate
    function requestWithdrawal(uint _tokensToWithdraw) external onlyWhitelist {
        require(_tokensToWithdraw > 0);
        require(balanceOf(msg.sender) >= _tokensToWithdraw);
        // No outstanding withdrawals can exist
        require(withdrawals[msg.sender].tokens == 0);
        // Transfer C20 tokens from msg.sender to liquidation escrow wallet
        c20Contract.transfer(this, _tokensToWithdraw);
        // Store requested withdrawal in withdrawal mapping
        withdrawals[msg.sender] = Withdrawal({tokens: _tokensToWithdraw, time: previousUpdateTime});
    }

    /// @notice Called by user after requesting withdrawal to carry out withdrawal
    function withdraw() external onlyWhitelist {
        uint tokens = withdrawals[msg.sender].tokens;
        // Withdrawal must have been requested
        require(tokens > 0);
        // previousUpdateTime when request was made
        uint requestTime = withdrawals[msg.sender].time;
        // Next price that was set after the request (maintaining forward pricing policy)
        Price memory priceAfterRequest = prices[requestTime];
        // Price must have been set after requestTime
        require(priceAfterRequest.numerator > 0);
        // Convert number of C20 tokens in liquidation request to ether
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

    /// @notice Add C20 tokens to fund wallet, transfer correstponding ether to participant
    function doWithdrawal(address _participant, uint _ethValue, uint _tokens) private {
        assert(address(this).balance >= _ethValue); //this.balance
        // Add transfer C20 tokens from msg.sender to fundWallet
        c20Contract.transfer(fundWallet, _tokens);
        //c20Contract.transferFrom(this, fundwallet, _tokens);
        // Transfer ether from contract to participant
        _participant.transfer(_ethValue);
        // TODO: Withdraw(_participant, _tokens, _ethValue);
    }

    /// @notice Refund tokens to participant, indicate failed transaction
    function failWithdrawal(address _participant, uint _ethValue, uint _tokens) private {
        assert(address(this).balance < _ethValue); //this.balance
        // Refund tokens to participant
        c20Contract.transfer(_participant, _tokens);
        //c20Contract.transferFrom(this, _participant, _tokens);
        // TODO: Withdraw(participant, tokens, 0);
    }

    /// @notice Managing wallets can transfer ether to contract
    function addLiquidity() external payable {
        require(msg.value > 0);
        // TODO: AddLiquidity(msg.value);
    }

    /// @notice Managing wallets can transfer ether from contract to fund wallet
    function removeLiquidity(uint _amount) external {
        require(_amount <= address(this).balance); //this.balance
        fundWallet.transfer(_amount);
        // TODO: RemoveLiquidity(_amount);
    }

    /// @notice Fund wallet can stop liquidation transactions from occurring
    function halt() external {
        halted = true;
    }

    /// @notice Fund wallet can allow liquidation transactions to occur again
    function unhalt() external {
        halted = false;
    }

    // TODO: Update C20 Contract Address
}
