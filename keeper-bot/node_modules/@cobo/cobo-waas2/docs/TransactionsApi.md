# CoboWaas2.TransactionsApi

All URIs are relative to *https://api.dev.cobo.com/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**broadcastSignedTransactions**](TransactionsApi.md#broadcastSignedTransactions) | **POST** /transactions/broadcast | Broadcast signed transactions
[**cancelTransactionById**](TransactionsApi.md#cancelTransactionById) | **POST** /transactions/{transaction_id}/cancel | Cancel transaction
[**checkLoopTransfers**](TransactionsApi.md#checkLoopTransfers) | **GET** /transactions/check_loop_transfers | Check Cobo Loop transfers
[**createContractCallTransaction**](TransactionsApi.md#createContractCallTransaction) | **POST** /transactions/contract_call | Call smart contract
[**createMessageSignTransaction**](TransactionsApi.md#createMessageSignTransaction) | **POST** /transactions/message_sign | Sign message
[**createTransferTransaction**](TransactionsApi.md#createTransferTransaction) | **POST** /transactions/transfer | Transfer token
[**dropTransactionById**](TransactionsApi.md#dropTransactionById) | **POST** /transactions/{transaction_id}/drop | Drop transaction
[**estimateFee**](TransactionsApi.md#estimateFee) | **POST** /transactions/estimate_fee | Estimate transaction fee
[**getTransactionApprovalDetail**](TransactionsApi.md#getTransactionApprovalDetail) | **GET** /transactions/{transaction_id}/approval_detail | Get transaction approval details
[**getTransactionById**](TransactionsApi.md#getTransactionById) | **GET** /transactions/{transaction_id} | Get transaction information
[**listApprovalDetails**](TransactionsApi.md#listApprovalDetails) | **GET** /transactions/approval/details | List approval details
[**listTransactionApprovalDetails**](TransactionsApi.md#listTransactionApprovalDetails) | **GET** /transactions/approval_details | List transaction approval details
[**listTransactionTemplates**](TransactionsApi.md#listTransactionTemplates) | **GET** /transactions/templates | List transaction templates
[**listTransactions**](TransactionsApi.md#listTransactions) | **GET** /transactions | List all transactions
[**resendTransactionById**](TransactionsApi.md#resendTransactionById) | **POST** /transactions/{transaction_id}/resend | Resend transaction
[**signAndBroadcastTransactionById**](TransactionsApi.md#signAndBroadcastTransactionById) | **POST** /transactions/{transaction_id}/sign_and_broadcast | Sign and broadcast transaction
[**speedupTransactionById**](TransactionsApi.md#speedupTransactionById) | **POST** /transactions/{transaction_id}/speedup | Speed up transaction



## broadcastSignedTransactions

> [BroadcastSignedTransactions201ResponseInner] broadcastSignedTransactions(opts)

Broadcast signed transactions

&lt;Note&gt;This operation is only applicable to the staking scenarios.&lt;/Note&gt; This operation broadcasts a list of signed transactions.   If you set &#x60;auto_broadcast&#x60; to &#x60;false&#x60; when [creating a staking activity](https://www.cobo.com/developers/v2/api-references/stakings/create-stake-activity), the transaction will not be submitted to the blockchain automatically after being signed. In such cases, you can call this operation to broadcast the transaction to the blockchain.  A transaction can only be broadcast if its status is &#x60;Broadcasting&#x60;. 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.TransactionsApi();
const opts = {
  'BroadcastSignedTransactionsRequest': new CoboWaas2.BroadcastSignedTransactionsRequest()
};
apiInstance.broadcastSignedTransactions(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **BroadcastSignedTransactionsRequest** | [**BroadcastSignedTransactionsRequest**](BroadcastSignedTransactionsRequest.md)| The request body to broadcast a list of signed transactions. | [optional] 

### Return type

[**[BroadcastSignedTransactions201ResponseInner]**](BroadcastSignedTransactions201ResponseInner.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## cancelTransactionById

> CreateTransferTransaction201Response cancelTransactionById(transaction_id)

Cancel transaction

This operation cancels a specified transaction. Canceling a transaction stops it while it is still pending. For more information, see [Cancel a transaction](https://www.cobo.com/developers/v2/guides/transactions/manage-transactions#cancel-a-transaction).  &lt;Note&gt;This operation only applies to transactions from MPC Wallets and Smart Contract Wallets.&lt;/Note&gt;  A transaction can be cancelled if its status is either of the following: - &#x60;Submitted&#x60; - &#x60;PendingScreening&#x60; - &#x60;PendingAuthorization&#x60; - &#x60;PendingSignature&#x60; (Only when the sub-status is &#x60;Queue&#x60;, &#x60;InsufficientBalance&#x60;, &#x60;InsufficientBalanceFundLocked&#x60;, &#x60;PendingSignerApproval&#x60;, &#x60;PendingSystemProcessing&#x60;, or &#x60;Built&#x60;) 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.TransactionsApi();
const transaction_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.cancelTransactionById(transaction_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **transaction_id** | **String**| The transaction ID. | 

### Return type

[**CreateTransferTransaction201Response**](CreateTransferTransaction201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## checkLoopTransfers

> [CheckLoopTransfers200ResponseInner] checkLoopTransfers(token_id, source_wallet_id, destination_addresses)

Check Cobo Loop transfers

This operation verifies if the transactions from a given source wallet to a list of given destinations can be executed as Cobo Loop transfers.   For more information about Cobo Loop, see [Cobo Loop&#39;s product manuals](https://manuals.cobo.com/en/portal/custodial-wallets/cobo-loop). 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.TransactionsApi();
const token_id = "ETH_USDT";
const source_wallet_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const destination_addresses = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97";
apiInstance.checkLoopTransfers(token_id, source_wallet_id, destination_addresses).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **token_id** | **String**| The token ID, which is the unique identifier of a token. You can retrieve the IDs of all the tokens you can use by calling [List enabled tokens](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-tokens). | 
 **source_wallet_id** | **String**| The wallet ID of the transaction source. | 
 **destination_addresses** | **String**| A list of destination addresses, separated by comma. | 

### Return type

[**[CheckLoopTransfers200ResponseInner]**](CheckLoopTransfers200ResponseInner.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## createContractCallTransaction

> CreateTransferTransaction201Response createContractCallTransaction(opts)

Call smart contract

This operation creates a transaction to interact with a smart contract on the blockchain.  You need to provide details such as the source address, destination address, and the calldata. You can specify the fee-related properties to limit the transaction fee. A transaction request for tracking is returned upon successful operation.  For smart contract call examples, you can refer to [Batch transfers using smart contracts](/v2/guides/transactions/batch-transfer) and [Swap tokens on Solana using Jupiter](/v2/guides/transactions/sol-jupiter-swap).  &lt;Note&gt;This operation uses &#x60;request_id&#x60; to prevent duplicate contract call requests. The &#x60;request_id&#x60; must be unique within the same organization. Duplicate requests with the same &#x60;request_id&#x60; will be rejected with an error and will not be executed again.&lt;/Note&gt;  &lt;Info&gt; Supported actions vary by blockchain: - EVM chains — Support deploying contracts and calling contract functions. - Solana — Supports calling contract functions only. - TRON — Supports calling contract functions only. - Stellar — Supports XLM trustline creation only. - Cosmos — Supports initiating Cosmos native message-based transactions, such as transfers and staking operations. &lt;/Info&gt;  &lt;Note&gt;Currently, this operation only applies to transactions from Custodial Wallets (Web3 Wallets), MPC Wallets, or Smart Contract Wallets. Refer to the &#x60;destination&#x60; property for supported contract types.&lt;/Note&gt;  &lt;Info&gt;If you initiate a transaction from a Smart Contract Wallet, a relevant transaction will be triggered from the Delegate to the Cobo Safe&#39;s address of the Smart Contract Wallet, with a transfer amount of &lt;code&gt;0&lt;/code&gt;.&lt;/Info&gt; 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.TransactionsApi();
const opts = {
  'ContractCallParams': new CoboWaas2.ContractCallParams()
};
apiInstance.createContractCallTransaction(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ContractCallParams** | [**ContractCallParams**](ContractCallParams.md)| The request body for making a contract call. | [optional] 

### Return type

[**CreateTransferTransaction201Response**](CreateTransferTransaction201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## createMessageSignTransaction

> CreateTransferTransaction201Response createMessageSignTransaction(opts)

Sign message

This operation creates a transaction to sign the provided message using cryptographic techniques.  In some scenarios, you want to sign a message for identity authentication or transaction approval. You need to provide details such as the source address, destination address, and the message to be signed. A transaction request for tracking is returned upon successful operation.  You can get the signature result by calling [Get transaction information](https://www.cobo.com/developers/v2/api-references/transactions/get-transaction-information).   &lt;Note&gt; This operation only supports message signing transactions from the following wallets and chains: - MPC Wallets: BTC, EVM-compatible chains, and Cosmos.   - Custodial Wallets (Web3 Wallets): EVM-compatible chains. &lt;/Note&gt; 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.TransactionsApi();
const opts = {
  'MessageSignParams': new CoboWaas2.MessageSignParams()
};
apiInstance.createMessageSignTransaction(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **MessageSignParams** | [**MessageSignParams**](MessageSignParams.md)| The request body to create a message signing transaction | [optional] 

### Return type

[**CreateTransferTransaction201Response**](CreateTransferTransaction201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## createTransferTransaction

> CreateTransferTransaction201Response createTransferTransaction(opts)

Transfer token

The operation transfers your assets from a wallet created on Cobo Portal to another address.  You need to specify details such as the sender address and recipient address, token ID, and the amount to transfer. You can specify the fee-related properties to limit the transaction fee. A transaction request for tracking is returned upon successful operation.  &lt;Note&gt;This operation uses &#x60;request_id&#x60; to prevent duplicate transfer requests. The &#x60;request_id&#x60; must be unique within the same organization. Duplicate requests with the same &#x60;request_id&#x60; will be rejected with an error and will not be executed again.&lt;/Note&gt;  &lt;Note&gt;If you make transfers from Custodial Wallets (Asset Wallets) and Exchange Wallets, do not set the fee-related properties, as they will not take effects.&lt;/Note&gt;  &lt;Note&gt;You can transfer tokens to multiple addresses only if you use MPC Wallets as the transaction source. To do this, you should use the &lt;code&gt;utxo_outputs&lt;/code&gt; property to specify the destination addresses.&lt;/Note&gt;  &lt;Info&gt;If you initiate a transaction from a Smart Contract Wallet, a relevant transaction will be triggered from the Delegate to the Cobo Safe&#39;s address of the Smart Contract Wallet, with a transfer amount of &lt;code&gt;0&lt;/code&gt;.&lt;/Info&gt; 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.TransactionsApi();
const opts = {
  'TransferParams': new CoboWaas2.TransferParams()
};
apiInstance.createTransferTransaction(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **TransferParams** | [**TransferParams**](TransferParams.md)| The request body to create a transfer transaction | [optional] 

### Return type

[**CreateTransferTransaction201Response**](CreateTransferTransaction201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## dropTransactionById

> CreateTransferTransaction201Response dropTransactionById(transaction_id, opts)

Drop transaction

This operation drops a specified transaction. Dropping a transaction leverages RBF to replace the original transaction with a version that effectively cancels it. For more details about dropping a transaction, refer to [Drop a transaction](https://www.cobo.com/developers/v2/guides/transactions/manage-transactions#drop-a-transaction).  A transaction can be dropped only if its status is &#x60;Broadcasting&#x60;.  &lt;Note&gt;This operation only applies to transactions from Custodial Wallets (Web3 Wallets), MPC Wallets and Smart Contract Wallets. It does not apply to transactions on the following chains: VET, TRON, TVET, SOL, and TON.&lt;/Note&gt;  You can use the &#x60;address&#x60; or &#x60;included_utxos&#x60; properties in the request body to specify the address or UTXOs that will cover the transaction fee. Generally, the transaction fee is paid by the original transaction&#39;s source. If that source&#39;s balance is insufficient, the specified address or UTXOs can be used to cover the fee. 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.TransactionsApi();
const transaction_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'TransactionRbf': new CoboWaas2.TransactionRbf()
};
apiInstance.dropTransactionById(transaction_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **transaction_id** | **String**| The transaction ID. | 
 **TransactionRbf** | [**TransactionRbf**](TransactionRbf.md)| The request body to drop or to speed up transactions | [optional] 

### Return type

[**CreateTransferTransaction201Response**](CreateTransferTransaction201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## estimateFee

> EstimatedFee estimateFee(opts)

Estimate transaction fee

This operation estimates the transaction fee of a token transfer or a contract call based on the fee model that the chain uses, considering factors such as network congestion and transaction complexity.  You need to specify the transaction information, including the request ID, request type, source address, destination address, token ID (only applicable to token transfers), and chain ID (only applicable to contract calls).  The response can contain different properties based on the transaction fee model used by the chain. For the legacy, EIP-1559, and UTXO fee models, Cobo also supports three different transaction speed levels: slow, recommended, and fast. For more information about estimating transaction fees, refer to [Estimate transaction fee](https://www.cobo.com/developers/v2/guides/transactions/estimate-fees). 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.TransactionsApi();
const opts = {
  'EstimateFeeParams': new CoboWaas2.EstimateFeeParams()
};
apiInstance.estimateFee(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **EstimateFeeParams** | [**EstimateFeeParams**](EstimateFeeParams.md)| The request body to estimate the transaction fee of a token transfer or a contract call. | [optional] 

### Return type

[**EstimatedFee**](EstimatedFee.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## getTransactionApprovalDetail

> TransactionApprovalDetail getTransactionApprovalDetail(transaction_id)

Get transaction approval details

This operation retrieves detailed approval information about a specified transaction. 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.TransactionsApi();
const transaction_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.getTransactionApprovalDetail(transaction_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **transaction_id** | **String**| The transaction ID. | 

### Return type

[**TransactionApprovalDetail**](TransactionApprovalDetail.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getTransactionById

> TransactionDetail getTransactionById(transaction_id)

Get transaction information

This operation retrieves detailed information about a specified transaction, such as the transaction status, source address, destination address, and timestamp. 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.TransactionsApi();
const transaction_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.getTransactionById(transaction_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **transaction_id** | **String**| The transaction ID. | 

### Return type

[**TransactionDetail**](TransactionDetail.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listApprovalDetails

> [ApprovalDetail] listApprovalDetails(opts)

List approval details

This operation retrieves comprehensive approval information for transactions, including approval status, reviewer details, signatures, and approval history. You can filter the results by transaction IDs, Cobo IDs, or request IDs.   This operation is commonly used to monitor approval progress and identify delays in multi-signature workflows. 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.TransactionsApi();
const opts = {
  'transaction_ids': "f47ac10b-58cc-4372-a567-0e02b2c3d479,557918d2-632a-4fe1-932f-315711f05fe3",
  'cobo_ids': "20231213122855000000000000000000,20231213122955000000000000000000",
  'request_ids': "web_send_by_user_327_1610444045047,web_send_by_user_327_1610444045048"
};
apiInstance.listApprovalDetails(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **transaction_ids** | **String**| A list of transaction IDs, separated by comma. | [optional] 
 **cobo_ids** | **String**| A list of Cobo IDs, separated by comma. A Cobo ID can be used to track a transaction. | [optional] 
 **request_ids** | **String**| A list of request IDs, separated by comma. | [optional] 

### Return type

[**[ApprovalDetail]**](ApprovalDetail.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listTransactionApprovalDetails

> ListTransactionApprovalDetails200Response listTransactionApprovalDetails(opts)

List transaction approval details

This operation retrieves detailed approval information for all transactions. 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.TransactionsApi();
const opts = {
  'transaction_ids': "f47ac10b-58cc-4372-a567-0e02b2c3d479,557918d2-632a-4fe1-932f-315711f05fe3",
  'cobo_ids': "20231213122855000000000000000000,20231213122955000000000000000000"
};
apiInstance.listTransactionApprovalDetails(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **transaction_ids** | **String**| A list of transaction IDs, separated by comma. | [optional] 
 **cobo_ids** | **String**| A list of Cobo IDs, separated by comma. A Cobo ID can be used to track a transaction. | [optional] 

### Return type

[**ListTransactionApprovalDetails200Response**](ListTransactionApprovalDetails200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listTransactionTemplates

> [ApprovalTemplate] listTransactionTemplates(template_key, opts)

List transaction templates

This operation retrieves approval templates based on the specified template key and template version.  These templates define the content used to generate approval messages displayed to users, including messages for transaction approvals and other approval workflows. 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.TransactionsApi();
const template_key = "withdrawal";
const opts = {
  'template_version': "1.0.0"
};
apiInstance.listTransactionTemplates(template_key, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **template_key** | **String**| Key of the transaction template used to create an approval message.  | 
 **template_version** | **String**| Version of the template. | [optional] 

### Return type

[**[ApprovalTemplate]**](ApprovalTemplate.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listTransactions

> ListTransactions200Response listTransactions(opts)

List all transactions

This operation retrieves all the transactions under your organization.  You can filter the results by request ID, Cobo ID, transaction ID, transaction hash, type, status, and timestamps. You can also paginate and sort your query results. 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.TransactionsApi();
const opts = {
  'request_id': "web_send_by_user_327_1610444045047",
  'cobo_ids': "20231213122855000000000000000000,20231213122955000000000000000000",
  'transaction_ids': "f47ac10b-58cc-4372-a567-0e02b2c3d479,557918d2-632a-4fe1-932f-315711f05fe3",
  'transaction_hashes': "239861be9a4afe080c359b7fe4a1d035945ec46256b1a0f44d1267c71de8ec28",
  'types': "Deposit,Withdrawal",
  'statuses': "Completed,Failed",
  'wallet_ids': "f47ac10b-58cc-4372-a567-0e02b2c3d479,1ddca562-8434-41c9-8809-d437bad9c868",
  'chain_ids': "BTC,ETH",
  'token_ids': "ETH_USDT,ETH_USDC",
  'asset_ids': "USDT,USDC",
  'vault_id': "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  'wallet_type': new CoboWaas2.WalletType(),
  'wallet_subtype': new CoboWaas2.WalletSubtype(),
  'project_id': "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  'min_created_timestamp': 1635744000000,
  'max_created_timestamp': 1635744000000,
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk",
  'direction': "ASC"
};
apiInstance.listTransactions(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_id** | **String**| The request ID that is used to track a transaction request. The request ID is provided by you and must be unique within your organization. | [optional] 
 **cobo_ids** | **String**| A list of Cobo IDs, separated by comma. A Cobo ID can be used to track a transaction. | [optional] 
 **transaction_ids** | **String**| A list of transaction IDs, separated by comma. | [optional] 
 **transaction_hashes** | **String**| A list of transaction hashes, separated by comma. | [optional] 
 **types** | **String**| A list of transaction types, separated by comma. Possible values include:    - &#x60;Deposit&#x60;: A deposit transaction.   - &#x60;Withdrawal&#x60;: A withdrawal transaction.   - &#x60;ContractCall&#x60;: A transaction that interacts with a smart contract.   - &#x60;MessageSign&#x60;: A transaction that signs a message.    - &#x60;ExternalSafeTx&#x60;: A transaction to a Smart Contract Wallet (Safe{Wallet}) that requires one or multiple signatures to be executed.   - &#x60;Stake&#x60;: A transaction that creates a staking request.   - &#x60;Unstake&#x60;: A transaction that creates a unstaking request.  | [optional] 
 **statuses** | **String**| A list of transaction statuses, separated by comma. Possible values include:    - &#x60;Submitted&#x60;: The transaction is submitted.   - &#x60;PendingScreening&#x60;: The transaction is pending screening by Risk Control.    - &#x60;PendingAuthorization&#x60;: The transaction is pending approvals.   - &#x60;PendingSignature&#x60;: The transaction is pending signature.    - &#x60;Broadcasting&#x60;: The transaction is being broadcast.   - &#x60;Confirming&#x60;: The transaction is waiting for the required number of confirmations.   - &#x60;Completed&#x60;: The transaction is completed.   - &#x60;Failed&#x60;: The transaction failed.   - &#x60;Rejected&#x60;: The transaction is rejected.   - &#x60;Pending&#x60;: The transaction is waiting to be included in the next block of the blockchain.  | [optional] 
 **wallet_ids** | **String**| A list of wallet IDs, separated by comma. | [optional] 
 **chain_ids** | **String**| A list of chain IDs, separated by comma. The chain ID is the unique identifier of a blockchain. You can retrieve the IDs of all the chains you can use by calling [List enabled chains](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-chains). | [optional] 
 **token_ids** | **String**| A list of token IDs, separated by comma. The token ID is the unique identifier of a token. You can retrieve the IDs of all the tokens you can use by calling [List enabled tokens](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-tokens). | [optional] 
 **asset_ids** | **String**| (This concept applies to Exchange Wallets only) A list of asset IDs, separated by comma. An asset ID is the unique identifier of the asset held within your linked exchange account. | [optional] 
 **vault_id** | **String**| The vault ID, which you can retrieve by calling [List all vaults](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-vaults). | [optional] 
 **wallet_type** | [**WalletType**](.md)| The wallet type.  - &#x60;Custodial&#x60;: [Custodial Wallets](https://manuals.cobo.com/en/portal/custodial-wallets/introduction)  - &#x60;MPC&#x60;: [MPC Wallets](https://manuals.cobo.com/en/portal/mpc-wallets/introduction)  - &#x60;SmartContract&#x60;: [Smart Contract Wallets](https://manuals.cobo.com/en/portal/smart-contract-wallets/introduction)  - &#x60;Exchange&#x60;: [Exchange Wallets](https://manuals.cobo.com/en/portal/exchange-wallets/introduction)  | [optional] 
 **wallet_subtype** | [**WalletSubtype**](.md)| The wallet subtype.  - &#x60;Asset&#x60;: Custodial Wallets (Asset Wallets)  - &#x60;Web3&#x60;: Custodial Wallets (Web3 Wallets)  - &#x60;Main&#x60;: Exchange Wallets (Main Account)  - &#x60;Sub&#x60;: Exchange Wallets (Sub Account)  - &#x60;Org-Controlled&#x60;: MPC Wallets (Organization-Controlled Wallets)  - &#x60;User-Controlled&#x60;: MPC Wallets (User-Controlled Wallets)  - &#x60;Safe{Wallet}&#x60;: Smart Contract Wallets (Safe{Wallet})  | [optional] 
 **project_id** | **String**| (This parameter is only applicable to User-Controlled Wallets.) The project ID, which you can retrieve by calling [List all projects](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-projects).  | [optional] 
 **min_created_timestamp** | **Number**| The time when the transaction was created, in Unix timestamp format, measured in milliseconds. You can use this parameter to filter transactions created on or after the specified time.  If you specify &#x60;min_created_timestamp&#x60; without specifying &#x60;max_created_timestamp&#x60;, &#x60;max_created_timestamp&#x60; is automatically set to &#x60;min_created_timestamp&#x60; + 90 days. If you specify both, the time range cannot exceed 90 days.  If not provided, the default value is 90 days before the current time. This default value is subject to change.  | [optional] 
 **max_created_timestamp** | **Number**| The time when the transaction was created, in Unix timestamp format, measured in milliseconds. You can use this parameter to filter transactions created on or before the specified time.  If you specify &#x60;max_created_timestamp&#x60; without specifying &#x60;min_created_timestamp&#x60;, &#x60;min_created_timestamp&#x60; is automatically set to &#x60;max_created_timestamp&#x60; - 90 days. If you specify both, the time range cannot exceed 90 days.  If not provided, the default value is the current time. This default value is subject to change.  | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 
 **direction** | **String**| The sort direction. Possible values include:   - &#x60;ASC&#x60;: Sort the results in ascending order.   - &#x60;DESC&#x60;: Sort the results in descending order.  | [optional] [default to &#39;ASC&#39;]

### Return type

[**ListTransactions200Response**](ListTransactions200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## resendTransactionById

> CreateTransferTransaction201Response resendTransactionById(transaction_id, opts)

Resend transaction

&lt;Note&gt;Resending failed transactions is not supported on the Solana network.&lt;/Note&gt;  This operation resends a specified transaction. Resending a transaction means retrying a previously failed transaction. For more details about resending a transaction, see [Resend a transaction](https://www.cobo.com/developers/v2/guides/transactions/manage-transactions#resend-a-transaction).  Resending a transaction is a high‑risk operation. Ensure that the original transaction has not been broadcast to the blockchain, has already expired, and will never be confirmed. Otherwise, the same transaction may be confirmed on‑chain twice.  &lt;Note&gt;This operation only applies to transactions from MPC Wallets in the SOL token.&lt;/Note&gt; 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.TransactionsApi();
const transaction_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'TransactionResend': new CoboWaas2.TransactionResend()
};
apiInstance.resendTransactionById(transaction_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **transaction_id** | **String**| The transaction ID. | 
 **TransactionResend** | [**TransactionResend**](TransactionResend.md)| The request body to resend transactions | [optional] 

### Return type

[**CreateTransferTransaction201Response**](CreateTransferTransaction201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## signAndBroadcastTransactionById

> CreateTransferTransaction201Response signAndBroadcastTransactionById(transaction_id)

Sign and broadcast transaction

This operation signs and broadcasts a specified transaction.  To call this operation, the following conditions must be met: - The &#x60;transaction_process_type&#x60; of the transaction must be set to &#x60;BuildOnly&#x60; when you call the [Transfer token](https://www.cobo.com/developers/v2/api-references/transactions/transfer-token) or [Call smart contract](https://www.cobo.com/developers/v2/api-references/transactions/call-smart-contract) operation.   - The transaction status must be &#x60;Built&#x60;. 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.TransactionsApi();
const transaction_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.signAndBroadcastTransactionById(transaction_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **transaction_id** | **String**| The transaction ID. | 

### Return type

[**CreateTransferTransaction201Response**](CreateTransferTransaction201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## speedupTransactionById

> CreateTransferTransaction201Response speedupTransactionById(transaction_id, opts)

Speed up transaction

This operation accelerates a specified transaction. Speeding up a transaction will trigger a Replace-By-Fee (RBF) transaction which is a new version of the original transaction. For more details about speeding up a transaction, refer to [Speed up a transaction](https://www.cobo.com/developers/v2/guides/transactions/manage-transactions#speed-up-a-transaction).  You can use the &#x60;address&#x60; or &#x60;included_utxos&#x60; properties in the request body to specify the address or UTXOs that will cover the transaction fee. Generally, the transaction fee is paid by the original transaction&#39;s source. If that source&#39;s balance is insufficient, the specified address or UTXOs can be used to cover the fee.  A transaction can be sped up only if its status is &#x60;Broadcasting&#x60;.  &lt;Note&gt;This operation only applies to transactions from Custodial Wallets (Web3 Wallets), MPC Wallets and Smart Contract Wallets. It does not apply to transactions on the following chains: VET, TRON, TVET, SOL, and TON.&lt;/Note&gt;  &lt;Info&gt;If you speed up a transaction from a Smart Contract Wallet, two RBF transactions will be triggered, one for the transaction from the Smart Contract Wallet, and the other for the transaction from the Delegate.&lt;/Info&gt; 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.TransactionsApi();
const transaction_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'TransactionRbf': new CoboWaas2.TransactionRbf()
};
apiInstance.speedupTransactionById(transaction_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **transaction_id** | **String**| The transaction ID. | 
 **TransactionRbf** | [**TransactionRbf**](TransactionRbf.md)| The request body to drop or to speed up transactions | [optional] 

### Return type

[**CreateTransferTransaction201Response**](CreateTransferTransaction201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

