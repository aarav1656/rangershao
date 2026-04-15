# CoboWaas2.FeeStationApi

All URIs are relative to *https://api.dev.cobo.com/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**checkFeeStationUsage**](FeeStationApi.md#checkFeeStationUsage) | **POST** /fee_station/check_fee_station_usage | Check Fee Station usage
[**estimateFeeStationFee**](FeeStationApi.md#estimateFeeStationFee) | **POST** /fee_station/transactions/estimate_fee | Estimate transaction fee
[**getFeeStationTransactionById**](FeeStationApi.md#getFeeStationTransactionById) | **GET** /fee_station/transactions/{transaction_id} | Get Fee Station transaction information
[**listFeeStationAddresses**](FeeStationApi.md#listFeeStationAddresses) | **GET** /fee_station/addresses | List Fee Station addresses
[**listFeeStationFiatTransactions**](FeeStationApi.md#listFeeStationFiatTransactions) | **GET** /fee_station/fiat_transactions | List Fee Station fiat transactions
[**listFeeStationTransactions**](FeeStationApi.md#listFeeStationTransactions) | **GET** /fee_station/transactions | List all Fee Station transactions
[**listTokenBalancesForFeeStation**](FeeStationApi.md#listTokenBalancesForFeeStation) | **GET** /fee_station/tokens | List Fee Station token balances



## checkFeeStationUsage

> FeeStationCheckFeeStationUsageResponse checkFeeStationUsage(opts)

Check Fee Station usage

This operation evaluates Fee Station usage for the current transaction.   It determines whether Fee station can be used, checks if the Fee Station balance is sufficient, and returns a breakdown of the amounts involved, including any portion that must be covered by the user or sponsored in USD stablecoin. 

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
const apiInstance = new CoboWaas2.FeeStationApi();
const opts = {
  'FeeStationCheckFeeStationUsage': new CoboWaas2.FeeStationCheckFeeStationUsage()
};
apiInstance.checkFeeStationUsage(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **FeeStationCheckFeeStationUsage** | [**FeeStationCheckFeeStationUsage**](FeeStationCheckFeeStationUsage.md)| The request body for evaluating Fee Station usage. | [optional] 

### Return type

[**FeeStationCheckFeeStationUsageResponse**](FeeStationCheckFeeStationUsageResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## estimateFeeStationFee

> EstimatedFixedFee estimateFeeStationFee(opts)

Estimate transaction fee

&lt;Note&gt;This operation is **deprecated**. Please use the enhanced version [Check Fee Station usage](https://www.cobo.com/developers/v2/api-references/feestation/check-fee-station-usage) instead.&lt;/Note&gt;   This operation estimates the transaction fee of a token transfer based on the fee model that the chain uses, considering factors such as network congestion and transaction complexity.  You need to specify the transaction information, including destination address, token ID.  The response can contain different properties based on the transaction fee model used by the chain. For the legacy, EIP-1559, and UTXO fee models, Cobo also supports three different transaction speed levels: slow, recommended, and fast. For more information about estimating transaction fees, refer to [Estimate transaction fee](https://www.cobo.com/developers/v2/guides/transactions/estimate-fees). 

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
const apiInstance = new CoboWaas2.FeeStationApi();
const opts = {
  'FeeStationTransfer': new CoboWaas2.FeeStationTransfer()
};
apiInstance.estimateFeeStationFee(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **FeeStationTransfer** | [**FeeStationTransfer**](FeeStationTransfer.md)| The information about a Fee Station top-up transaction. | [optional] 

### Return type

[**EstimatedFixedFee**](EstimatedFixedFee.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## getFeeStationTransactionById

> TransactionDetail getFeeStationTransactionById(transaction_id)

Get Fee Station transaction information

This operation retrieves detailed information about a specified Fee Station transaction record, such as the transaction status, source address, destination address, and timestamp. 

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
const apiInstance = new CoboWaas2.FeeStationApi();
const transaction_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.getFeeStationTransactionById(transaction_id).then((data) => {
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


## listFeeStationAddresses

> ListAddresses200Response listFeeStationAddresses(opts)

List Fee Station addresses

This operation retrieves a list of deposit addresses of your Fee Station, including the chain ID, address, and additional information. You can filter the result by chain ID and address. 

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
const apiInstance = new CoboWaas2.FeeStationApi();
const opts = {
  'chain_ids': "BTC,ETH",
  'addresses': "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listFeeStationAddresses(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **chain_ids** | **String**| A list of chain IDs, separated by comma. The chain ID is the unique identifier of a blockchain. You can retrieve the IDs of all the chains you can use by calling [List enabled chains](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-chains). | [optional] 
 **addresses** | **String**| A list of wallet addresses, separated by comma. For addresses requiring a memo, append the memo after the address using the &#39;|&#39; separator (e.g., \&quot;address|memo\&quot;). | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListAddresses200Response**](ListAddresses200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listFeeStationFiatTransactions

> ListFeeStationFiatTransactions200Response listFeeStationFiatTransactions(opts)

List Fee Station fiat transactions

This operation retrieves all Fee Station fiat transactions under your organization.  You can filter the results by request IDs, transaction IDs, transaction type, and created timestamp. You can also paginate your query results. 

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
const apiInstance = new CoboWaas2.FeeStationApi();
const opts = {
  'transaction_ids': "f47ac10b-58cc-4372-a567-0e02b2c3d479,557918d2-632a-4fe1-932f-315711f05fe3",
  'transaction_type': new CoboWaas2.FeeStationFiatTransactionType(),
  'min_created_timestamp': 1635744000000,
  'max_created_timestamp': 1635744000000,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk",
  'limit': 10
};
apiInstance.listFeeStationFiatTransactions(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **transaction_ids** | **String**| A list of transaction IDs, separated by comma. | [optional] 
 **transaction_type** | [**FeeStationFiatTransactionType**](.md)| The type of the fiat transaction. Possible values include:   - &#x60;deposit&#x60;: A deposit transaction.   - &#x60;transfer&#x60;: A transfer transaction.  | [optional] 
 **min_created_timestamp** | **Number**| The time when the transaction was created, in Unix timestamp format, measured in milliseconds. You can use this parameter to filter transactions created on or after the specified time.  If you specify &#x60;min_created_timestamp&#x60; without specifying &#x60;max_created_timestamp&#x60;, &#x60;max_created_timestamp&#x60; is automatically set to &#x60;min_created_timestamp&#x60; + 90 days. If you specify both, the time range cannot exceed 90 days.  If not provided, the default value is 90 days before the current time. This default value is subject to change.  | [optional] 
 **max_created_timestamp** | **Number**| The time when the transaction was created, in Unix timestamp format, measured in milliseconds. You can use this parameter to filter transactions created on or before the specified time.  If you specify &#x60;max_created_timestamp&#x60; without specifying &#x60;min_created_timestamp&#x60;, &#x60;min_created_timestamp&#x60; is automatically set to &#x60;max_created_timestamp&#x60; - 90 days. If you specify both, the time range cannot exceed 90 days.  If not provided, the default value is the current time. This default value is subject to change.  | [optional] 
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]

### Return type

[**ListFeeStationFiatTransactions200Response**](ListFeeStationFiatTransactions200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listFeeStationTransactions

> ListTransactions200Response listFeeStationTransactions(opts)

List all Fee Station transactions

This operation retrieves all Fee Station transactions under your organization.  You can filter the results by request ID, Cobo ID, transaction ID, transaction hash, type, status, and timestamp. You can also paginate and sort your query results. 

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
const apiInstance = new CoboWaas2.FeeStationApi();
const opts = {
  'request_id': "web_send_by_user_327_1610444045047",
  'cobo_ids': "20231213122855000000000000000000,20231213122955000000000000000000",
  'transaction_ids': "f47ac10b-58cc-4372-a567-0e02b2c3d479,557918d2-632a-4fe1-932f-315711f05fe3",
  'transaction_hashes': "239861be9a4afe080c359b7fe4a1d035945ec46256b1a0f44d1267c71de8ec28",
  'types': "Deposit,Withdrawal",
  'statuses': "Completed,Failed",
  'chain_ids': "BTC,ETH",
  'token_ids': "ETH_USDT,ETH_USDC",
  'asset_ids': "USDT,USDC",
  'min_created_timestamp': 1635744000000,
  'max_created_timestamp': 1635744000000,
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk",
  'direction': "ASC"
};
apiInstance.listFeeStationTransactions(opts).then((data) => {
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
 **types** | **String**| A list of transaction types for Fee Station, separated by comma. Possible values include:    - &#x60;Deposit&#x60;: A deposit transaction.   - &#x60;Withdrawal&#x60;: A withdrawal transaction.  | [optional] 
 **statuses** | **String**| A list of transaction statuses, separated by comma. Possible values include:    - &#x60;Submitted&#x60;: The transaction is submitted.   - &#x60;PendingScreening&#x60;: The transaction is pending screening by Risk Control.    - &#x60;PendingAuthorization&#x60;: The transaction is pending approvals.   - &#x60;PendingSignature&#x60;: The transaction is pending signature.    - &#x60;Broadcasting&#x60;: The transaction is being broadcast.   - &#x60;Confirming&#x60;: The transaction is waiting for the required number of confirmations.   - &#x60;Completed&#x60;: The transaction is completed.   - &#x60;Failed&#x60;: The transaction failed.   - &#x60;Rejected&#x60;: The transaction is rejected.   - &#x60;Pending&#x60;: The transaction is waiting to be included in the next block of the blockchain.  | [optional] 
 **chain_ids** | **String**| A list of chain IDs, separated by comma. The chain ID is the unique identifier of a blockchain. You can retrieve the IDs of all the chains you can use by calling [List enabled chains](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-chains). | [optional] 
 **token_ids** | **String**| A list of token IDs, separated by comma. The token ID is the unique identifier of a token. You can retrieve the IDs of all the tokens you can use by calling [List enabled tokens](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-tokens). | [optional] 
 **asset_ids** | **String**| (This concept applies to Exchange Wallets only) A list of asset IDs, separated by comma. An asset ID is the unique identifier of the asset held within your linked exchange account. | [optional] 
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


## listTokenBalancesForFeeStation

> ListTokenBalancesForFeeStation200Response listTokenBalancesForFeeStation(opts)

List Fee Station token balances

The operation retrieves a list of token balances within your Fee Station. 

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
const apiInstance = new CoboWaas2.FeeStationApi();
const opts = {
  'token_ids': "ETH_USDT,ETH_USDC",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listTokenBalancesForFeeStation(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **token_ids** | **String**| A list of token IDs, separated by comma. The token ID is the unique identifier of a token. You can retrieve the IDs of all the tokens you can use by calling [List enabled tokens](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-tokens). | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListTokenBalancesForFeeStation200Response**](ListTokenBalancesForFeeStation200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

