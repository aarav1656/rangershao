# CoboWaas2.WalletsApi

All URIs are relative to *https://api.dev.cobo.com/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**batchCheckUtxo**](WalletsApi.md#batchCheckUtxo) | **POST** /wallets/{wallet_id}/utxos/batch_check | Batch check UTXOs
[**checkAddressChainsValidity**](WalletsApi.md#checkAddressChainsValidity) | **GET** /wallets/check_address_chains_validity | Check address validity across chains
[**checkAddressValidity**](WalletsApi.md#checkAddressValidity) | **GET** /wallets/check_address_validity | Check address validity
[**checkAddressesValidity**](WalletsApi.md#checkAddressesValidity) | **GET** /wallets/check_addresses_validity | Check addresses validity
[**createAddress**](WalletsApi.md#createAddress) | **POST** /wallets/{wallet_id}/addresses | Create addresses in wallet
[**createTokenListingRequest**](WalletsApi.md#createTokenListingRequest) | **POST** /wallets/tokens/listing_requests | Create token listing request
[**createWallet**](WalletsApi.md#createWallet) | **POST** /wallets | Create wallet
[**deleteWalletById**](WalletsApi.md#deleteWalletById) | **POST** /wallets/{wallet_id}/delete | Delete wallet
[**getChainById**](WalletsApi.md#getChainById) | **GET** /wallets/chains/{chain_id} | Get chain information
[**getMaxTransferableValue**](WalletsApi.md#getMaxTransferableValue) | **GET** /wallets/{wallet_id}/max_transferable_value | Get maximum transferable value
[**getMaxTransferableValueWithFeeModel**](WalletsApi.md#getMaxTransferableValueWithFeeModel) | **POST** /wallets/{wallet_id}/max_transferable_value_with_fee_model | Estimate maximum transferable value
[**getTokenById**](WalletsApi.md#getTokenById) | **GET** /wallets/tokens/{token_id} | Get token information
[**getTokenListingRequestByRequestId**](WalletsApi.md#getTokenListingRequestByRequestId) | **GET** /wallets/tokens/listing_requests/{request_id} | Get token listing request
[**getWalletById**](WalletsApi.md#getWalletById) | **GET** /wallets/{wallet_id} | Get wallet information
[**listAddressBalancesByToken**](WalletsApi.md#listAddressBalancesByToken) | **GET** /wallets/{wallet_id}/tokens/{token_id} | List address balances by token
[**listAddresses**](WalletsApi.md#listAddresses) | **GET** /wallets/{wallet_id}/addresses | List wallet addresses
[**listEnabledChains**](WalletsApi.md#listEnabledChains) | **GET** /wallets/enabled_chains | List enabled chains
[**listEnabledTokens**](WalletsApi.md#listEnabledTokens) | **GET** /wallets/enabled_tokens | List enabled tokens
[**listSupportedChains**](WalletsApi.md#listSupportedChains) | **GET** /wallets/chains | List supported chains
[**listSupportedTokens**](WalletsApi.md#listSupportedTokens) | **GET** /wallets/tokens | List supported tokens
[**listTokenBalancesForAddress**](WalletsApi.md#listTokenBalancesForAddress) | **GET** /wallets/{wallet_id}/addresses/{address}/tokens | List token balances by address
[**listTokenBalancesForWallet**](WalletsApi.md#listTokenBalancesForWallet) | **GET** /wallets/{wallet_id}/tokens | List token balances by wallet
[**listTokenListingRequests**](WalletsApi.md#listTokenListingRequests) | **GET** /wallets/tokens/listing_requests | List token listing requests
[**listTransactionUtxos**](WalletsApi.md#listTransactionUtxos) | **GET** /wallets/{wallet_id}/transaction_utxos | List transaction UTXOs
[**listUtxos**](WalletsApi.md#listUtxos) | **GET** /wallets/{wallet_id}/utxos | List UTXOs
[**listWallets**](WalletsApi.md#listWallets) | **GET** /wallets | List all wallets
[**lockUtxos**](WalletsApi.md#lockUtxos) | **POST** /wallets/{wallet_id}/utxos/lock | Lock UTXOs
[**refreshAddressBalancesByToken**](WalletsApi.md#refreshAddressBalancesByToken) | **PUT** /wallets/{wallet_id}/tokens/{token_id}/refresh_address_balances | Refresh address balances by token
[**unlockUtxos**](WalletsApi.md#unlockUtxos) | **POST** /wallets/{wallet_id}/utxos/unlock | Unlock UTXOs
[**updateWalletById**](WalletsApi.md#updateWalletById) | **PUT** /wallets/{wallet_id} | Update wallet



## batchCheckUtxo

> BatchCheckUtxo201Response batchCheckUtxo(wallet_id, opts)

Batch check UTXOs

This operation verifies the existence and details of specified **unspent** transaction outputs (UTXOs) for a given wallet and token. A maximum of 100 UTXOs can be verified per request.  &lt;Note&gt;This operation returns only UTXOs that are not used by any transaction. It does not return all UTXOs.&lt;/Note&gt;  &lt;Info&gt;This operation is applicable to MPC Wallets and Custodial Wallets (Web3 Wallets) only.&lt;/Info&gt; 

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
const apiInstance = new CoboWaas2.WalletsApi();
const wallet_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'BatchCheckUtxoRequest': new CoboWaas2.BatchCheckUtxoRequest()
};
apiInstance.batchCheckUtxo(wallet_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_id** | **String**| The wallet ID. | 
 **BatchCheckUtxoRequest** | [**BatchCheckUtxoRequest**](BatchCheckUtxoRequest.md)| The request body of the Batch check UTXOs operation. | [optional] 

### Return type

[**BatchCheckUtxo201Response**](BatchCheckUtxo201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## checkAddressChainsValidity

> [CheckAddressChainsValidity200ResponseInner] checkAddressChainsValidity(address, chain_ids)

Check address validity across chains

This operation verifies if a given address is valid for a list of chains.  &lt;Note&gt;You can specify up to 20 chain IDs in a single request.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.WalletsApi();
const address = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
const chain_ids = "BTC,ETH";
apiInstance.checkAddressChainsValidity(address, chain_ids).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **address** | **String**| The wallet address. | 
 **chain_ids** | **String**| A list of chain IDs, separated by comma. The chain ID is the unique identifier of a blockchain. You can retrieve the IDs of all the chains you can use by calling [List enabled chains](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-chains). | 

### Return type

[**[CheckAddressChainsValidity200ResponseInner]**](CheckAddressChainsValidity200ResponseInner.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## checkAddressValidity

> CheckAddressValidity200Response checkAddressValidity(chain_id, address)

Check address validity

This operation verifies if a given address is valid for a specific chain. 

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
const apiInstance = new CoboWaas2.WalletsApi();
const chain_id = "ETH";
const address = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
apiInstance.checkAddressValidity(chain_id, address).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **chain_id** | **String**| The chain ID, which is the unique identifier of a blockchain. You can retrieve the IDs of all the chains you can use by calling [List enabled chains](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-chains). | 
 **address** | **String**| The wallet address. | 

### Return type

[**CheckAddressValidity200Response**](CheckAddressValidity200Response.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## checkAddressesValidity

> [CheckAddressesValidity200ResponseInner] checkAddressesValidity(chain_id, addresses)

Check addresses validity

This operation verifies if given addresses are valid for a specific chain. 

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
const apiInstance = new CoboWaas2.WalletsApi();
const chain_id = "ETH";
const addresses = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97";
apiInstance.checkAddressesValidity(chain_id, addresses).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **chain_id** | **String**| The chain ID, which is the unique identifier of a blockchain. You can retrieve the IDs of all the chains you can use by calling [List enabled chains](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-chains). | 
 **addresses** | **String**| A list of wallet addresses, separated by comma. You can specify a maximum of 100 addresses. | 

### Return type

[**[CheckAddressesValidity200ResponseInner]**](CheckAddressesValidity200ResponseInner.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## createAddress

> [AddressInfo] createAddress(wallet_id, opts)

Create addresses in wallet

This operation generates one or more addresses within a specified wallet.  &lt;Note&gt;This operation is applicable to Custodial Wallets and MPC Wallets only.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.WalletsApi();
const wallet_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'CreateAddressRequest': new CoboWaas2.CreateAddressRequest()
};
apiInstance.createAddress(wallet_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_id** | **String**| The wallet ID. | 
 **CreateAddressRequest** | [**CreateAddressRequest**](CreateAddressRequest.md)| The request body to generates addresses within a specified wallet. | [optional] 

### Return type

[**[AddressInfo]**](AddressInfo.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## createTokenListingRequest

> CreateTokenListingRequest201Response createTokenListingRequest(CreateTokenListingRequestRequest)

Create token listing request

This operation creates a token listing request. The token to be listed must already be deployed on the specified blockchain and have a valid contract address.  &lt;note&gt;Currently, tokens listed through this operation are only supported in wallets of type &#x60;Custodial&#x60; or &#x60;MPC&#x60;, and subtype &#x60;Asset&#x60;, &#x60;Web3&#x60;, or &#x60;Org-Controlled&#x60;.&lt;/note&gt; 

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
const apiInstance = new CoboWaas2.WalletsApi();
const CreateTokenListingRequestRequest = new CoboWaas2.CreateTokenListingRequestRequest();
apiInstance.createTokenListingRequest(CreateTokenListingRequestRequest).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **CreateTokenListingRequestRequest** | [**CreateTokenListingRequestRequest**](CreateTokenListingRequestRequest.md)| Request body for submitting a token listing request.  | 

### Return type

[**CreateTokenListingRequest201Response**](CreateTokenListingRequest201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## createWallet

> CreatedWalletInfo createWallet(opts)

Create wallet

This operation creates a wallet with the provided information.  &lt;Note&gt;This operation is not applicable to Smart Contract Wallets.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.WalletsApi();
const opts = {
  'CreateWalletParams': new CoboWaas2.CreateWalletParams()
};
apiInstance.createWallet(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **CreateWalletParams** | [**CreateWalletParams**](CreateWalletParams.md)| The request body to create a wallet | [optional] 

### Return type

[**CreatedWalletInfo**](CreatedWalletInfo.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## deleteWalletById

> DeleteWalletById201Response deleteWalletById(wallet_id)

Delete wallet

This operation deletes a specified wallet.  &lt;Note&gt;This operation is applicable to Exchange Wallets only.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.WalletsApi();
const wallet_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.deleteWalletById(wallet_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_id** | **String**| The wallet ID. | 

### Return type

[**DeleteWalletById201Response**](DeleteWalletById201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getChainById

> ChainInfo getChainById(chain_id)

Get chain information

This operation retrieves the detailed information about a specified chain. 

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
const apiInstance = new CoboWaas2.WalletsApi();
const chain_id = "ETH";
apiInstance.getChainById(chain_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **chain_id** | **String**| The chain ID, which is the unique identifier of a blockchain. | 

### Return type

[**ChainInfo**](ChainInfo.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getMaxTransferableValue

> MaxTransferableValue getMaxTransferableValue(wallet_id, token_id, fee_rate, to_address, opts)

Get maximum transferable value

&lt;Warning&gt;This operation is planned for deprecation. We recommend using  [Estimate maximum transferable value](https://www.cobo.com/developers/v2/api-references/wallets/estimate-maximum-transferable-value) instead.&lt;/Warning&gt; This operation retrieves the maximum amount that you can transfer from a wallet or a specified wallet address, along with the corresponding transaction fee.  You must specify &#x60;to_address&#x60; in your query because it affects the transaction fee.  &lt;Note&gt;This operation is applicable to Custodial Wallets and MPC Wallets only.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.WalletsApi();
const wallet_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const token_id = "ETH_USDT";
const fee_rate = "10";
const to_address = "2N2xFZtbCFB6Nb3Pj9Sxsx5mX2fxX3yEgkE";
const opts = {
  'from_address': "2N2xFZtbCFB6Nb3Pj9Sxsx5mX2fxX3yEgkE"
};
apiInstance.getMaxTransferableValue(wallet_id, token_id, fee_rate, to_address, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_id** | **String**| The wallet ID. | 
 **token_id** | **String**| The token ID, which is the unique identifier of a token. You can retrieve the IDs of all the tokens you can use by calling [List enabled tokens](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-tokens). | 
 **fee_rate** | **String**| The fee rate in sats/vByte or gas price in wei. | 
 **to_address** | **String**| The recipient&#39;s address. | 
 **from_address** | **String**| The sender&#39;s address. For EVM addresses in MPC Wallets, this parameter is required. | [optional] 

### Return type

[**MaxTransferableValue**](MaxTransferableValue.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getMaxTransferableValueWithFeeModel

> MaxTransferableValue getMaxTransferableValueWithFeeModel(wallet_id, opts)

Estimate maximum transferable value

This operation estimates the maximum transferable value from a wallet or a specific wallet address, based on the specified fee settings.  The &#x60;to_address&#x60; property is required because it affects the fee calculation.  &lt;Note&gt;This operation is applicable to Custodial Wallets (Web3 Wallets) and MPC Wallets only.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.WalletsApi();
const wallet_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'GetMaxTransferableValueWithFeeModelRequest': new CoboWaas2.GetMaxTransferableValueWithFeeModelRequest()
};
apiInstance.getMaxTransferableValueWithFeeModel(wallet_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_id** | **String**| The wallet ID. | 
 **GetMaxTransferableValueWithFeeModelRequest** | [**GetMaxTransferableValueWithFeeModelRequest**](GetMaxTransferableValueWithFeeModelRequest.md)| The request body for retrieving the maximum transferable value from a specified wallet. | [optional] 

### Return type

[**MaxTransferableValue**](MaxTransferableValue.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## getTokenById

> ExtendedTokenInfo getTokenById(token_id)

Get token information

This operation retrieves the detailed information about a specified token. 

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
const apiInstance = new CoboWaas2.WalletsApi();
const token_id = "ETH_USDT";
apiInstance.getTokenById(token_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **token_id** | **String**| The token ID, which is the unique identifier of a token. | 

### Return type

[**ExtendedTokenInfo**](ExtendedTokenInfo.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getTokenListingRequestByRequestId

> TokenListing getTokenListingRequestByRequestId(request_id)

Get token listing request

This operation retrieves detailed information about a specific token listing request, including its current status. 

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
const apiInstance = new CoboWaas2.WalletsApi();
const request_id = "123e4567e89b12d3a456426614174000";
apiInstance.getTokenListingRequestByRequestId(request_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_id** | **String**| The unique identifier of the token listing request. | 

### Return type

[**TokenListing**](TokenListing.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getWalletById

> WalletInfo getWalletById(wallet_id)

Get wallet information

This operation retrieves the detailed information about a specified wallet. 

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
const apiInstance = new CoboWaas2.WalletsApi();
const wallet_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.getWalletById(wallet_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_id** | **String**| The wallet ID. | 

### Return type

[**WalletInfo**](WalletInfo.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listAddressBalancesByToken

> ListAddressBalancesByToken200Response listAddressBalancesByToken(wallet_id, token_id, opts)

List address balances by token

This operation retrieves a list of address balances for a specified token within a wallet.  &lt;Note&gt;This operation is applicable to MPC Wallets and Custodial Wallets (Web3 Wallets) only.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.WalletsApi();
const wallet_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const token_id = "ETH_USDT";
const opts = {
  'addresses': "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listAddressBalancesByToken(wallet_id, token_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_id** | **String**| The wallet ID. | 
 **token_id** | **String**| The token ID, which is the unique identifier of a token. | 
 **addresses** | **String**| A list of wallet addresses, separated by comma. For addresses requiring a memo, append the memo after the address using the &#39;|&#39; separator (e.g., \&quot;address|memo\&quot;). | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListAddressBalancesByToken200Response**](ListAddressBalancesByToken200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listAddresses

> ListAddresses200Response listAddresses(wallet_id, opts)

List wallet addresses

This operation retrieves a list of addresses within a specified wallet. &lt;Note&gt; For Web3 Wallets, Asset Wallets, and MPC Wallets, addresses created on one EVM chain automatically work on all other supported EVM chains.   Currently, query results for EVM chain addresses differ between interfaces:  - API: Query results are limited by chain_id, so only addresses from that specific chain are returned. - Cobo Portal: Displays addresses from all supported EVM chains, so the number of addresses may be larger than the API results. &lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.WalletsApi();
const wallet_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'chain_ids': "BTC,ETH",
  'addresses': "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listAddresses(wallet_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_id** | **String**| The wallet ID. | 
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


## listEnabledChains

> ListSupportedChains200Response listEnabledChains(opts)

List enabled chains

This operation retrieves all the chains that can be used by your organization.   You can filter the result by wallet type or subtype. If you do not specify a wallet type, this operation returns a combination of chains that can be used by your organization for each wallet type. 

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
const apiInstance = new CoboWaas2.WalletsApi();
const opts = {
  'wallet_type': new CoboWaas2.WalletType(),
  'wallet_subtype': new CoboWaas2.WalletSubtype(),
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listEnabledChains(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_type** | [**WalletType**](.md)| The wallet type.  - &#x60;Custodial&#x60;: [Custodial Wallets](https://manuals.cobo.com/en/portal/custodial-wallets/introduction)  - &#x60;MPC&#x60;: [MPC Wallets](https://manuals.cobo.com/en/portal/mpc-wallets/introduction)  - &#x60;SmartContract&#x60;: [Smart Contract Wallets](https://manuals.cobo.com/en/portal/smart-contract-wallets/introduction)  - &#x60;Exchange&#x60;: [Exchange Wallets](https://manuals.cobo.com/en/portal/exchange-wallets/introduction)  | [optional] 
 **wallet_subtype** | [**WalletSubtype**](.md)| The wallet subtype.  - &#x60;Asset&#x60;: Custodial Wallets (Asset Wallets)  - &#x60;Web3&#x60;: Custodial Wallets (Web3 Wallets)  - &#x60;Main&#x60;: Exchange Wallets (Main Account)  - &#x60;Sub&#x60;: Exchange Wallets (Sub Account)  - &#x60;Org-Controlled&#x60;: MPC Wallets (Organization-Controlled Wallets)  - &#x60;User-Controlled&#x60;: MPC Wallets (User-Controlled Wallets)  - &#x60;Safe{Wallet}&#x60;: Smart Contract Wallets (Safe{Wallet})  | [optional] 
 **limit** | **Number**| The maximum number of objects to return. The value range is [1, 500]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListSupportedChains200Response**](ListSupportedChains200Response.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listEnabledTokens

> ListSupportedTokens200Response listEnabledTokens(opts)

List enabled tokens

This operation retrieves all the tokens that can be used by your organization.   You can filter the result by wallet type, subtype, chain IDs, and token IDs. If you do not specify a wallet type, this operation returns a combination of tokens that can be used by your organization for each wallet type. 

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
const apiInstance = new CoboWaas2.WalletsApi();
const opts = {
  'wallet_type': new CoboWaas2.WalletType(),
  'wallet_subtype': new CoboWaas2.WalletSubtype(),
  'chain_ids': "BTC,ETH",
  'token_ids': "ETH_USDT,ETH_USDC",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listEnabledTokens(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_type** | [**WalletType**](.md)| The wallet type.  - &#x60;Custodial&#x60;: [Custodial Wallets](https://manuals.cobo.com/en/portal/custodial-wallets/introduction)  - &#x60;MPC&#x60;: [MPC Wallets](https://manuals.cobo.com/en/portal/mpc-wallets/introduction)  - &#x60;SmartContract&#x60;: [Smart Contract Wallets](https://manuals.cobo.com/en/portal/smart-contract-wallets/introduction)  - &#x60;Exchange&#x60;: [Exchange Wallets](https://manuals.cobo.com/en/portal/exchange-wallets/introduction)  | [optional] 
 **wallet_subtype** | [**WalletSubtype**](.md)| The wallet subtype.  - &#x60;Asset&#x60;: Custodial Wallets (Asset Wallets)  - &#x60;Web3&#x60;: Custodial Wallets (Web3 Wallets)  - &#x60;Main&#x60;: Exchange Wallets (Main Account)  - &#x60;Sub&#x60;: Exchange Wallets (Sub Account)  - &#x60;Org-Controlled&#x60;: MPC Wallets (Organization-Controlled Wallets)  - &#x60;User-Controlled&#x60;: MPC Wallets (User-Controlled Wallets)  - &#x60;Safe{Wallet}&#x60;: Smart Contract Wallets (Safe{Wallet})  | [optional] 
 **chain_ids** | **String**| A list of chain IDs(Supports up to 500), separated by comma. The chain ID is the unique identifier of a blockchain. You can retrieve the IDs of all the chains you can use by calling [List enabled chains](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-chains). | [optional] 
 **token_ids** | **String**| A list of token IDs(Supports up to 500), separated by comma. The token ID is the unique identifier of a token. You can retrieve the IDs of all the tokens you can use by calling [List enabled tokens](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-tokens). | [optional] 
 **limit** | **Number**| The maximum number of objects to return. The value range is [1, 500]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListSupportedTokens200Response**](ListSupportedTokens200Response.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listSupportedChains

> ListSupportedChains200Response listSupportedChains(opts)

List supported chains

This operation retrieves all chains supported by a specific wallet type or subtype.   It provides details such as the chain ID, chain symbol, and other relevant information. If you do not specify a wallet type, this operation returns a combination of chains supported by each wallet type. You can filter the result by chain IDs. The chain metadata is publicly available without any permission restrictions.  Cobo Portal currently supports over 80 blockchains and more than 3,000 tokens. In addition to this operation, you can also view the full list of supported chains [here](https://www.cobo.com/chains). We regularly update the list with new additions. If you want to request support for a specific chain or token, please [contact us](https://www.cobo.com/contact). 

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
const apiInstance = new CoboWaas2.WalletsApi();
const opts = {
  'wallet_type': new CoboWaas2.WalletType(),
  'wallet_subtype': new CoboWaas2.WalletSubtype(),
  'chain_ids': "BTC,ETH",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listSupportedChains(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_type** | [**WalletType**](.md)| The wallet type.  - &#x60;Custodial&#x60;: [Custodial Wallets](https://manuals.cobo.com/en/portal/custodial-wallets/introduction)  - &#x60;MPC&#x60;: [MPC Wallets](https://manuals.cobo.com/en/portal/mpc-wallets/introduction)  - &#x60;SmartContract&#x60;: [Smart Contract Wallets](https://manuals.cobo.com/en/portal/smart-contract-wallets/introduction)  - &#x60;Exchange&#x60;: [Exchange Wallets](https://manuals.cobo.com/en/portal/exchange-wallets/introduction)  | [optional] 
 **wallet_subtype** | [**WalletSubtype**](.md)| The wallet subtype.  - &#x60;Asset&#x60;: Custodial Wallets (Asset Wallets)  - &#x60;Web3&#x60;: Custodial Wallets (Web3 Wallets)  - &#x60;Main&#x60;: Exchange Wallets (Main Account)  - &#x60;Sub&#x60;: Exchange Wallets (Sub Account)  - &#x60;Org-Controlled&#x60;: MPC Wallets (Organization-Controlled Wallets)  - &#x60;User-Controlled&#x60;: MPC Wallets (User-Controlled Wallets)  - &#x60;Safe{Wallet}&#x60;: Smart Contract Wallets (Safe{Wallet})  | [optional] 
 **chain_ids** | **String**| A list of chain IDs(Supports up to 500), separated by comma. The chain ID is the unique identifier of a blockchain. You can retrieve the IDs of all the chains you can use by calling [List enabled chains](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-chains). | [optional] 
 **limit** | **Number**| The maximum number of objects to return. The value range is [1, 500]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListSupportedChains200Response**](ListSupportedChains200Response.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listSupportedTokens

> ListSupportedTokens200Response listSupportedTokens(opts)

List supported tokens

This operation retrieves all tokens supported by a specific wallet type or subtype.   It provides details such as token ID, token symbol, and other relevant information. If you do not specify a wallet type, this operation returns a combination of tokens supported by each wallet type. You can filter the result by token IDs or chain IDs. The token metadata is publicly available without any permission restrictions.  Cobo Portal currently supports over 80 blockchains and more than 3,000 tokens. In addition to this operation, you can also view the full list of supported tokens [here](https://www.cobo.com/tokens). We regularly update the list with new additions. If you want to request support for a specific chain or token, please [contact us](https://www.cobo.com/contact). 

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
const apiInstance = new CoboWaas2.WalletsApi();
const opts = {
  'wallet_type': new CoboWaas2.WalletType(),
  'wallet_subtype': new CoboWaas2.WalletSubtype(),
  'chain_ids': "BTC,ETH",
  'token_ids': "ETH_USDT,ETH_USDC",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listSupportedTokens(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_type** | [**WalletType**](.md)| The wallet type.  - &#x60;Custodial&#x60;: [Custodial Wallets](https://manuals.cobo.com/en/portal/custodial-wallets/introduction)  - &#x60;MPC&#x60;: [MPC Wallets](https://manuals.cobo.com/en/portal/mpc-wallets/introduction)  - &#x60;SmartContract&#x60;: [Smart Contract Wallets](https://manuals.cobo.com/en/portal/smart-contract-wallets/introduction)  - &#x60;Exchange&#x60;: [Exchange Wallets](https://manuals.cobo.com/en/portal/exchange-wallets/introduction)  | [optional] 
 **wallet_subtype** | [**WalletSubtype**](.md)| The wallet subtype.  - &#x60;Asset&#x60;: Custodial Wallets (Asset Wallets)  - &#x60;Web3&#x60;: Custodial Wallets (Web3 Wallets)  - &#x60;Main&#x60;: Exchange Wallets (Main Account)  - &#x60;Sub&#x60;: Exchange Wallets (Sub Account)  - &#x60;Org-Controlled&#x60;: MPC Wallets (Organization-Controlled Wallets)  - &#x60;User-Controlled&#x60;: MPC Wallets (User-Controlled Wallets)  - &#x60;Safe{Wallet}&#x60;: Smart Contract Wallets (Safe{Wallet})  | [optional] 
 **chain_ids** | **String**| A list of chain IDs(Supports up to 500), separated by comma. The chain ID is the unique identifier of a blockchain. You can retrieve the IDs of all the chains you can use by calling [List enabled chains](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-chains). | [optional] 
 **token_ids** | **String**| A list of token IDs(Supports up to 500), separated by comma. The token ID is the unique identifier of a token. You can retrieve the IDs of all the tokens you can use by calling [List enabled tokens](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-tokens). | [optional] 
 **limit** | **Number**| The maximum number of objects to return. The value range is [1, 500]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListSupportedTokens200Response**](ListSupportedTokens200Response.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listTokenBalancesForAddress

> ListTokenBalancesForAddress200Response listTokenBalancesForAddress(wallet_id, address, opts)

List token balances by address

The operation retrieves a list of token balances for a specified address within a wallet.   &lt;Note&gt;This operation is applicable to MPC Wallets, Custodial Wallets (Web3 Wallets), and Smart Contract Wallets only.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.WalletsApi();
const wallet_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const address = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
const opts = {
  'token_ids': "ETH_USDT,ETH_USDC",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listTokenBalancesForAddress(wallet_id, address, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_id** | **String**| The wallet ID. | 
 **address** | **String**| The wallet address. | 
 **token_ids** | **String**| A list of token IDs, separated by comma. The token ID is the unique identifier of a token. You can retrieve the IDs of all the tokens you can use by calling [List enabled tokens](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-tokens). | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListTokenBalancesForAddress200Response**](ListTokenBalancesForAddress200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listTokenBalancesForWallet

> ListTokenBalancesForAddress200Response listTokenBalancesForWallet(wallet_id, opts)

List token balances by wallet

The operation retrieves a list of token balances within a specified wallet.  &lt;Note&gt;This operation is not applicable to Exchange Wallets.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.WalletsApi();
const wallet_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'token_ids': "ETH_USDT,ETH_USDC",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listTokenBalancesForWallet(wallet_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_id** | **String**| The wallet ID. | 
 **token_ids** | **String**| A list of token IDs, separated by comma. The token ID is the unique identifier of a token. You can retrieve the IDs of all the tokens you can use by calling [List enabled tokens](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-tokens). | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListTokenBalancesForAddress200Response**](ListTokenBalancesForAddress200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listTokenListingRequests

> ListTokenListingRequests200Response listTokenListingRequests(opts)

List token listing requests

This operation lists all token listing requests in your organization. You can filter the results by request status. 

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
const apiInstance = new CoboWaas2.WalletsApi();
const opts = {
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk",
  'status': new CoboWaas2.TokenListingRequestStatus()
};
apiInstance.listTokenListingRequests(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 
 **status** | [**TokenListingRequestStatus**](.md)| The current status of the token listing request. | [optional] 

### Return type

[**ListTokenListingRequests200Response**](ListTokenListingRequests200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listTransactionUtxos

> ListUtxos200Response listTransactionUtxos(wallet_id, chain_id, tx_hash, opts)

List transaction UTXOs

The operation retrieves a list of UTXOs for a specified transaction of a wallet. You must specify the wallet, chain, and transaction hash.  &lt;Note&gt;This operation is applicable to MPC and Custodial Web3 Wallets.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.WalletsApi();
const wallet_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const chain_id = "ETH";
const tx_hash = "dd7e1cecf6bbde1844ee1815b780711a1e306a718bcd23cd64401b48ef88eb83";
const opts = {
  'is_change': false,
  'vout_n': 0,
  'token_id': "ETH_USDT",
  'address': "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listTransactionUtxos(wallet_id, chain_id, tx_hash, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_id** | **String**| The wallet ID. | 
 **chain_id** | **String**| The chain ID, which is the unique identifier of a blockchain. You can retrieve the IDs of all the chains you can use by calling [List enabled chains](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-chains). | 
 **tx_hash** | **String**| The transaction hash to filter UTXOs by. | 
 **is_change** | **Boolean**| Filter UTXOs by whether they are change outputs. | [optional] 
 **vout_n** | **Number**| The output index of the UTXO to filter by. | [optional] 
 **token_id** | **String**| The token ID, which is the unique identifier of a token. You can retrieve the IDs of all the tokens you can use by calling [List enabled tokens](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-tokens). | [optional] 
 **address** | **String**|  | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListUtxos200Response**](ListUtxos200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listUtxos

> ListUtxos200Response listUtxos(wallet_id, token_id, opts)

List UTXOs

The operation retrieves a list of **unspent** transaction outputs (UTXOs) for a specified wallet and token.  &lt;Note&gt;This operation returns only UTXOs that are not used by any transaction. It does not return all UTXOs.&lt;/Note&gt;  &lt;Info&gt;This operation is applicable to MPC Wallets and Custodial Wallets (Web3 Wallets) only.&lt;/Info&gt; 

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
const apiInstance = new CoboWaas2.WalletsApi();
const wallet_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const token_id = "ETH_USDT";
const opts = {
  'address': "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  'tx_hash': "dd7e1cecf6bbde1844ee1815b780711a1e306a718bcd23cd64401b48ef88eb83",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listUtxos(wallet_id, token_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_id** | **String**| The wallet ID. | 
 **token_id** | **String**| The token ID, which is the unique identifier of a token. You can retrieve the IDs of all the tokens you can use by calling [List enabled tokens](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-tokens). | 
 **address** | **String**|  | [optional] 
 **tx_hash** | **String**|  | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListUtxos200Response**](ListUtxos200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listWallets

> ListWallets200Response listWallets(opts)

List all wallets

This operation retrieves the information of all wallets under your organization. You can filter the result by wallet type and subtype. For MPC Wallets, you can also filter by project ID and vault ID. 

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
const apiInstance = new CoboWaas2.WalletsApi();
const opts = {
  'wallet_type': new CoboWaas2.WalletType(),
  'wallet_subtype': new CoboWaas2.WalletSubtype(),
  'project_id': "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  'vault_id': "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listWallets(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_type** | [**WalletType**](.md)| The wallet type.  - &#x60;Custodial&#x60;: [Custodial Wallets](https://manuals.cobo.com/en/portal/custodial-wallets/introduction)  - &#x60;MPC&#x60;: [MPC Wallets](https://manuals.cobo.com/en/portal/mpc-wallets/introduction)  - &#x60;SmartContract&#x60;: [Smart Contract Wallets](https://manuals.cobo.com/en/portal/smart-contract-wallets/introduction)  - &#x60;Exchange&#x60;: [Exchange Wallets](https://manuals.cobo.com/en/portal/exchange-wallets/introduction)  | [optional] 
 **wallet_subtype** | [**WalletSubtype**](.md)| The wallet subtype.  - &#x60;Asset&#x60;: Custodial Wallets (Asset Wallets)  - &#x60;Web3&#x60;: Custodial Wallets (Web3 Wallets)  - &#x60;Main&#x60;: Exchange Wallets (Main Account)  - &#x60;Sub&#x60;: Exchange Wallets (Sub Account)  - &#x60;Org-Controlled&#x60;: MPC Wallets (Organization-Controlled Wallets)  - &#x60;User-Controlled&#x60;: MPC Wallets (User-Controlled Wallets)  - &#x60;Safe{Wallet}&#x60;: Smart Contract Wallets (Safe{Wallet})  | [optional] 
 **project_id** | **String**| (This parameter is only applicable to User-Controlled Wallets.) The project ID, which you can retrieve by calling [List all projects](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-projects).  | [optional] 
 **vault_id** | **String**| The vault ID, which you can retrieve by calling [List all vaults](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-vaults). | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListWallets200Response**](ListWallets200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## lockUtxos

> LockUtxos201Response lockUtxos(wallet_id, opts)

Lock UTXOs

This operation locks the UTXOs with specified transaction hashes. Locked UTXOs cannot be transferred until unlocked.  &lt;Note&gt;This operation is applicable to MPC Wallets and Custodial Wallets (Web3 Wallets) only.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.WalletsApi();
const wallet_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'LockUtxosRequest': new CoboWaas2.LockUtxosRequest()
};
apiInstance.lockUtxos(wallet_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_id** | **String**| The wallet ID. | 
 **LockUtxosRequest** | [**LockUtxosRequest**](LockUtxosRequest.md)| The request body of the Lock/Unlock UTXOs operation. | [optional] 

### Return type

[**LockUtxos201Response**](LockUtxos201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## refreshAddressBalancesByToken

> RefreshAddressBalancesByToken200Response refreshAddressBalancesByToken(wallet_id, token_id, opts)

Refresh address balances by token

This operation refreshes the balances of specified addresses for a given token within a wallet.  The successful return of the request only means that the refresh request has been submitted.  &lt;Note&gt;This operation is applicable to MPC Wallets only.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.WalletsApi();
const wallet_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const token_id = "ETH_USDT";
const opts = {
  'RefreshAddressBalancesByTokenRequest': new CoboWaas2.RefreshAddressBalancesByTokenRequest()
};
apiInstance.refreshAddressBalancesByToken(wallet_id, token_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_id** | **String**| The wallet ID. | 
 **token_id** | **String**| The token ID, which is the unique identifier of a token. | 
 **RefreshAddressBalancesByTokenRequest** | [**RefreshAddressBalancesByTokenRequest**](RefreshAddressBalancesByTokenRequest.md)| The request body to refresh addresses balances. | [optional] 

### Return type

[**RefreshAddressBalancesByToken200Response**](RefreshAddressBalancesByToken200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## unlockUtxos

> LockUtxos201Response unlockUtxos(wallet_id, opts)

Unlock UTXOs

This operation unlocks the UTXOs with specified transaction hashes. Locked UTXOs cannot be transferred until unlocked.    &lt;Note&gt;This operation is applicable to MPC Wallets and Custodial Wallets (Web3 Wallets) only.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.WalletsApi();
const wallet_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'LockUtxosRequest': new CoboWaas2.LockUtxosRequest()
};
apiInstance.unlockUtxos(wallet_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_id** | **String**| The wallet ID. | 
 **LockUtxosRequest** | [**LockUtxosRequest**](LockUtxosRequest.md)| The request body of the Lock/Unlock UTXOs operation. | [optional] 

### Return type

[**LockUtxos201Response**](LockUtxos201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## updateWalletById

> WalletInfo updateWalletById(wallet_id, opts)

Update wallet

This operation updates the information of a specified wallet. 

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
const apiInstance = new CoboWaas2.WalletsApi();
const wallet_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'UpdateWalletParams': new CoboWaas2.UpdateWalletParams()
};
apiInstance.updateWalletById(wallet_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_id** | **String**| The wallet ID. | 
 **UpdateWalletParams** | [**UpdateWalletParams**](UpdateWalletParams.md)| The request body. | [optional] 

### Return type

[**WalletInfo**](WalletInfo.md)

### Authorization

[OAuth2](../README.md#OAuth2)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

