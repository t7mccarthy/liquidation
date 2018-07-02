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


contract C20Interface {
  function balanceOf(address _owner) constant returns (uint);
  //function verifyParticipant(address participant) external;
}


/// @title C20 liquidation contract
/// @author Tom McCarthy
/// @notice Liquidates C20 tokens held by participants in the Cryto20 fund
contract Liquidation is SafeMath {
    // Address of C20 contract on ethereum
    address C20InterfaceAddress = 0xab38...
    C20Interface c20Contract = C20Interface(C20InterfaceAddress);

    // PUBLIC VARIABLES:
    /// @dev Managing wallets from C20 contract
    address public fundWallet;
    address public controlWallet;

    /// @dev Control of liquidation within liquidation contract
    address public liquidationWallet;

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
    /// @dev Adress mapped to C20 token balance
    mapping (address => uint256) balances;

    /// @dev Adress mapped to whitelist status of user
    mapping (address => bool) public whitelist;

    /// @dev Previous update time mapped to most recently retrieved price
    mapping (uint256 => Price) public prices;

    /// @dev Address mapped to withdrawal
    mapping (address => Withdrawal) public withdrawals

    //MODIFIERS:
    // TODO: create modifiers

    // EVENTS:
    // TODO: create events for functions to communicate with front-end

    // CONSTRUCTOR:
    // TODO: create constructor to set up contract

    // FUNCTIONS:
    /// @notice Fallback function allowing contract to accept ether
    function () payable {}

    /// @notice Updates number of C20 tokens per set amount of ether
    /// @dev Current update time is not mapped to current price in order to maintain forward pricing policy
    function updatePrice(uint256 )_newNumerator) external {
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
    function updatePriceDenominator(uint256 )_newDenominator) external {
        require(_newDenominator > 0);
        // Update denominator of currentPrice
        currentPrice.denominator = _newDenominator;
        // Map previous update time to updated price
        prices[previousUpdateTime] = currentPrice;
        // Update previousUpdateTime
        previousUpdateTime = now;
    }

    /// @notice Gets C20 token balance of participant from C20 contract
    function balanceOf(address _participant) view returns (uint balance) {
        // TODO: Get balance from balanceOf function in C20 contract
        return c20Contract.balanceOf(_participant);
    }

    /// @notice Allows user to request a certain amount of tokens to liquidate
    function requestWithdrawal(uint _tokensToWithdraw) external {
        require(_tokensToWithdraw > 0);
        require(balanceOf(msg.sender) >= _tokensToWithdraw);
        // No outstanding withdrawals can exist
        require(withdrawals[msg.sender].tokens == 0);
        // Reduce token balance of user by tokens to liquidate
        balances[msg.sender] = safeSub(balances[msg.sender], _tokensToWithdraw);
        // Store requested withdrawal in withdrawal mapping
        withdrawals[msg.sender] = Withdrawal({tokens: _tokensToWithdraw, time: previousUpdateTime});
    }

    /// @notice Called by user after requesting withdrawal to carry out withdrawal
    function withdraw() external {
        uint tokens = withdrawals[msg.sender].tokens;
        // Withdrawal must have been requested
        require(tokens > 0);
        // previousUpdateTime when request was made
        uint requestTime = withdrawals[msg.sender].time;
        // Next price that was set after the request (maintaining forward pricing policy)
        Price priceAfterRequest = prices[requestTime];
        // Price must have been set after requestTime
        require(priceAfterRequest.numerator > 0);
        // Convert number of C20 tokens in liquidation request to ether
        uint256 ethValue = safeMul(tokens, price.denominator) / price.numerator;
        // Reset mapping storing requested withdrawals
        withdrawals[msg.sender].tokens = 0;

        // If liquidation contract has enough ether in balance to perform liquidation transaction
        if (this.balance >= ethValue) {
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
        assert(this.balance >= _ethValue);
        // Add tokens to fundWallet
        balances[fundWallet] = safeAdd(balances[fundWallet], _tokens);
        // Transfer ether from contract to participant
        _participant.transfer(_ethValue);
        // TODO: Withdraw(_participant, _tokens, _ethValue);
    }

    /// @notice Refund tokens to participant, indicate failed transaction
    function failWithdrawal(address _participant, uint _ethValue, uint _tokens) private {
        assert(this.balance < withdrawValue);
        // Refund tokens to participant
        balances[_participant] = safeAdd(balances[_participant], _tokens);
        // TODO: Withdraw(participant, tokens, 0);
    }

    /// @notice Managing wallets can transfer ether to contract
    function addLiquidity() external payable {
        require(msg.value > 0);
        // TODO: AddLiquidity(msg.value);
    }

    /// @notice Managing wallets can transfer ether from contract to fund wallet
    function removeLiquidity(uint _amount) external {
        require(_amount <= this.balance);
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
}
