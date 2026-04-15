# CoboWaas2.TokenizationApi

All URIs are relative to *https://api.dev.cobo.com/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**burnTokenization**](TokenizationApi.md#burnTokenization) | **POST** /tokenization/tokens/{token_id}/burn | Burn tokens
[**estimateTokenizationFee**](TokenizationApi.md#estimateTokenizationFee) | **POST** /tokenization/estimate_fee | Estimate tokenization operation fee
[**getTokenizationActivity**](TokenizationApi.md#getTokenizationActivity) | **GET** /tokenization/activities/{activity_id} | Get tokenization activity details
[**getTokenizationAllowlistActivation**](TokenizationApi.md#getTokenizationAllowlistActivation) | **GET** /tokenization/tokens/{token_id}/allowlist/activation | Get allowlist activation status
[**getTokenizationInfo**](TokenizationApi.md#getTokenizationInfo) | **GET** /tokenization/tokens/{token_id} | Get token details
[**issueToken**](TokenizationApi.md#issueToken) | **POST** /tokenization/tokens | Issue token
[**listIssuedTokens**](TokenizationApi.md#listIssuedTokens) | **GET** /tokenization/tokens | List issued tokens
[**listTokenizationActivities**](TokenizationApi.md#listTokenizationActivities) | **GET** /tokenization/activities | List tokenization activities
[**listTokenizationAllowlistAddresses**](TokenizationApi.md#listTokenizationAllowlistAddresses) | **GET** /tokenization/tokens/{token_id}/allowlist/addresses | List addresses on allowlist
[**listTokenizationBlocklistAddresses**](TokenizationApi.md#listTokenizationBlocklistAddresses) | **GET** /tokenization/tokens/{token_id}/blocklist/addresses | List addresses on blocklist
[**listTokenizationHoldings**](TokenizationApi.md#listTokenizationHoldings) | **GET** /tokenization/tokens/{token_id}/holdings | Get token holdings information
[**listTokenizationPermissions**](TokenizationApi.md#listTokenizationPermissions) | **GET** /tokenization/tokens/{token_id}/permissions | List token permissions
[**listTokenizationSupportedChains**](TokenizationApi.md#listTokenizationSupportedChains) | **GET** /tokenization/enabled_chains | List supported chains for tokenization
[**mintTokenization**](TokenizationApi.md#mintTokenization) | **POST** /tokenization/tokens/{token_id}/mint | Mint tokens
[**pauseTokenization**](TokenizationApi.md#pauseTokenization) | **POST** /tokenization/tokens/{token_id}/pause | Pause token contract
[**tokenizationContractCall**](TokenizationApi.md#tokenizationContractCall) | **POST** /tokenization/tokens/{token_id}/contract_call | Call token contract
[**unpauseTokenization**](TokenizationApi.md#unpauseTokenization) | **POST** /tokenization/tokens/{token_id}/unpause | Unpause token contract
[**updateTokenizationAllowlistActivation**](TokenizationApi.md#updateTokenizationAllowlistActivation) | **POST** /tokenization/tokens/{token_id}/allowlist/activation | Activate or deactivate allowlist
[**updateTokenizationAllowlistAddresses**](TokenizationApi.md#updateTokenizationAllowlistAddresses) | **POST** /tokenization/tokens/{token_id}/allowlist/addresses | Update addresses on allowlist
[**updateTokenizationBlocklistAddresses**](TokenizationApi.md#updateTokenizationBlocklistAddresses) | **POST** /tokenization/tokens/{token_id}/blocklist/addresses | Update addresses on blocklist
[**updateTokenizationPermissions**](TokenizationApi.md#updateTokenizationPermissions) | **POST** /tokenization/tokens/{token_id}/permissions | Update token permissions



## burnTokenization

> TokenizationOperationResponse burnTokenization(token_id, opts)

Burn tokens

This operation burns tokens from a specified address. Creates a burn transaction that will decrease the token supply.  **Note**: This operation is not supported for CoboERC20Wrapper and SOLWrapper tokens. 

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
const apiInstance = new CoboWaas2.TokenizationApi();
const token_id = "ETH_USDT";
const opts = {
  'TokenizationBurnTokenRequest': new CoboWaas2.TokenizationBurnTokenRequest()
};
apiInstance.burnTokenization(token_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **token_id** | **String**| The token ID, which is the unique identifier of a token. | 
 **TokenizationBurnTokenRequest** | [**TokenizationBurnTokenRequest**](TokenizationBurnTokenRequest.md)| The request body for burning tokens. | [optional] 

### Return type

[**TokenizationOperationResponse**](TokenizationOperationResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## estimateTokenizationFee

> EstimatedFee estimateTokenizationFee(TokenizationEstimateFeeRequest)

Estimate tokenization operation fee

This operation estimates the fee required for tokenization operations. For EVM-based chains, this calculates the gas cost for the specified operation. 

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
const apiInstance = new CoboWaas2.TokenizationApi();
const TokenizationEstimateFeeRequest = new CoboWaas2.TokenizationEstimateFeeRequest();
apiInstance.estimateTokenizationFee(TokenizationEstimateFeeRequest).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **TokenizationEstimateFeeRequest** | [**TokenizationEstimateFeeRequest**](TokenizationEstimateFeeRequest.md)| The request body to estimate tokenization operation fee. | 

### Return type

[**EstimatedFee**](EstimatedFee.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## getTokenizationActivity

> TokenizationActivityInfo getTokenizationActivity(activity_id)

Get tokenization activity details

This operation retrieves the detailed information for a specific tokenization activity by its ID. 

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
const apiInstance = new CoboWaas2.TokenizationApi();
const activity_id = "b7c8e9d0-f1a2-3b4c-5d6e-7f8a9b0c1d2e";
apiInstance.getTokenizationActivity(activity_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **activity_id** | **String**| The ID of the activity. | 

### Return type

[**TokenizationActivityInfo**](TokenizationActivityInfo.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getTokenizationAllowlistActivation

> GetTokenizationAllowlistActivation200Response getTokenizationAllowlistActivation(token_id)

Get allowlist activation status

This operation retrieves the allowlist activation status of the token contract. 

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
const apiInstance = new CoboWaas2.TokenizationApi();
const token_id = "ETH_USDT";
apiInstance.getTokenizationAllowlistActivation(token_id).then((data) => {
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

[**GetTokenizationAllowlistActivation200Response**](GetTokenizationAllowlistActivation200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getTokenizationInfo

> TokenizationTokenDetailInfo getTokenizationInfo(token_id)

Get token details

This operation retrieves the detailed information for a specific issued token by its ID. 

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
const apiInstance = new CoboWaas2.TokenizationApi();
const token_id = "ETH_USDT";
apiInstance.getTokenizationInfo(token_id).then((data) => {
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

[**TokenizationTokenDetailInfo**](TokenizationTokenDetailInfo.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## issueToken

> TokenizationOperationResponse issueToken(TokenizationIssuedTokenRequest)

Issue token

This operation issues a new token contract. It supports various blockchain platforms.  For EVM-based chains, this involves issuing a new smart contract from a template. 

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
const apiInstance = new CoboWaas2.TokenizationApi();
const TokenizationIssuedTokenRequest = new CoboWaas2.TokenizationIssuedTokenRequest();
apiInstance.issueToken(TokenizationIssuedTokenRequest).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **TokenizationIssuedTokenRequest** | [**TokenizationIssuedTokenRequest**](TokenizationIssuedTokenRequest.md)| The request body to issue a new token. | 

### Return type

[**TokenizationOperationResponse**](TokenizationOperationResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## listIssuedTokens

> TokenizationListTokenInfoResponse listIssuedTokens(opts)

List issued tokens

This operation retrieves a list of tokens issued by the organization. Returns issued token information including total supply, holdings, and token status. 

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
const apiInstance = new CoboWaas2.TokenizationApi();
const opts = {
  'chain_id': "ETH",
  'token_id': "ETH_USDT",
  'token_standard': new CoboWaas2.TokenizationTokenStandard(),
  'status': new CoboWaas2.TokenizationStatus(),
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listIssuedTokens(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **chain_id** | **String**| The chain ID, which is the unique identifier of a blockchain. You can retrieve the IDs of all the chains you can use by calling [List enabled chains](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-chains). | [optional] 
 **token_id** | **String**| The token ID, which is the unique identifier of a token. You can retrieve the IDs of all the tokens you can use by calling [List enabled tokens](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-tokens). | [optional] 
 **token_standard** | [**TokenizationTokenStandard**](.md)| Filter by token standard. | [optional] 
 **status** | [**TokenizationStatus**](.md)| Filter by token status. | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**TokenizationListTokenInfoResponse**](TokenizationListTokenInfoResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listTokenizationActivities

> TokenizationListActivitiesResponse listTokenizationActivities(opts)

List tokenization activities

This operation retrieves a list of tokenization activities. 

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
const apiInstance = new CoboWaas2.TokenizationApi();
const opts = {
  'token_id': "ETH_USDT",
  'activity_type': new CoboWaas2.TokenizationOperationType(),
  'activity_status': new CoboWaas2.TokenizationActivityStatus(),
  'limit': 10,
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk",
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'direction': "ASC"
};
apiInstance.listTokenizationActivities(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **token_id** | **String**| The token ID, which is the unique identifier of a token. You can retrieve the IDs of all the tokens you can use by calling [List enabled tokens](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-tokens). | [optional] 
 **activity_type** | [**TokenizationOperationType**](.md)| Filter by tokenization activity type. | [optional] 
 **activity_status** | [**TokenizationActivityStatus**](.md)| Filter by tokenization activity status. | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **direction** | **String**| The sort direction. Possible values include:   - &#x60;ASC&#x60;: Sort the results in ascending order.   - &#x60;DESC&#x60;: Sort the results in descending order.  | [optional] [default to &#39;ASC&#39;]

### Return type

[**TokenizationListActivitiesResponse**](TokenizationListActivitiesResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listTokenizationAllowlistAddresses

> TokenizationAllowlistAddressesResponse listTokenizationAllowlistAddresses(token_id, opts)

List addresses on allowlist

This operation lists addresses on the allowlist. 

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
const apiInstance = new CoboWaas2.TokenizationApi();
const token_id = "ETH_USDT";
const opts = {
  'limit': 10,
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk",
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'direction': "ASC"
};
apiInstance.listTokenizationAllowlistAddresses(token_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **token_id** | **String**| The token ID, which is the unique identifier of a token. | 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **direction** | **String**| The sort direction. Possible values include:   - &#x60;ASC&#x60;: Sort the results in ascending order.   - &#x60;DESC&#x60;: Sort the results in descending order.  | [optional] [default to &#39;ASC&#39;]

### Return type

[**TokenizationAllowlistAddressesResponse**](TokenizationAllowlistAddressesResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listTokenizationBlocklistAddresses

> ListTokenizationBlocklistAddresses200Response listTokenizationBlocklistAddresses(token_id, opts)

List addresses on blocklist

This operation lists addresses on the blocklist. 

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
const apiInstance = new CoboWaas2.TokenizationApi();
const token_id = "ETH_USDT";
const opts = {
  'limit': 10,
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk",
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'direction': "ASC"
};
apiInstance.listTokenizationBlocklistAddresses(token_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **token_id** | **String**| The token ID, which is the unique identifier of a token. | 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **direction** | **String**| The sort direction. Possible values include:   - &#x60;ASC&#x60;: Sort the results in ascending order.   - &#x60;DESC&#x60;: Sort the results in descending order.  | [optional] [default to &#39;ASC&#39;]

### Return type

[**ListTokenizationBlocklistAddresses200Response**](ListTokenizationBlocklistAddresses200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listTokenizationHoldings

> TokenizationListHoldingsResponse listTokenizationHoldings(token_id, opts)

Get token holdings information

This operation retrieves the holdings information for a specific issued token, showing which wallets hold the token and their respective balances. 

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
const apiInstance = new CoboWaas2.TokenizationApi();
const token_id = "ETH_USDT";
const opts = {
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listTokenizationHoldings(token_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **token_id** | **String**| The token ID, which is the unique identifier of a token. | 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**TokenizationListHoldingsResponse**](TokenizationListHoldingsResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listTokenizationPermissions

> TokenizationListPermissionsResponse listTokenizationPermissions(token_id, opts)

List token permissions

This operation retrieves the permission settings for a tokenization contract. 

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
const apiInstance = new CoboWaas2.TokenizationApi();
const token_id = "ETH_USDT";
const opts = {
  'address': "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  'limit': 10,
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk",
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'direction': "ASC"
};
apiInstance.listTokenizationPermissions(token_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **token_id** | **String**| The token ID, which is the unique identifier of a token. | 
 **address** | **String**| The address to query permissions for. If not provided, returns all addresses with permissions. | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **direction** | **String**| The sort direction. Possible values include:   - &#x60;ASC&#x60;: Sort the results in ascending order.   - &#x60;DESC&#x60;: Sort the results in descending order.  | [optional] [default to &#39;ASC&#39;]

### Return type

[**TokenizationListPermissionsResponse**](TokenizationListPermissionsResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listTokenizationSupportedChains

> TokenizationListEnabledChainsResponse listTokenizationSupportedChains(opts)

List supported chains for tokenization

This operation retrieves a list of tokenization supported chains. 

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
const apiInstance = new CoboWaas2.TokenizationApi();
const opts = {
  'token_standard': new CoboWaas2.TokenizationTokenStandard(),
  'limit': 10,
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk",
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1"
};
apiInstance.listTokenizationSupportedChains(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **token_standard** | [**TokenizationTokenStandard**](.md)| Filter by token standard. | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 

### Return type

[**TokenizationListEnabledChainsResponse**](TokenizationListEnabledChainsResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## mintTokenization

> TokenizationOperationResponse mintTokenization(token_id, TokenizationMintTokenRequest)

Mint tokens

This operation mints new tokens to a specified address. Creates a mint transaction that will increase the token supply.  **Note**: This operation is not supported for CoboERC20Wrapper and SOLWrapper tokens. 

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
const apiInstance = new CoboWaas2.TokenizationApi();
const token_id = "ETH_USDT";
const TokenizationMintTokenRequest = new CoboWaas2.TokenizationMintTokenRequest();
apiInstance.mintTokenization(token_id, TokenizationMintTokenRequest).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **token_id** | **String**| The token ID, which is the unique identifier of a token. | 
 **TokenizationMintTokenRequest** | [**TokenizationMintTokenRequest**](TokenizationMintTokenRequest.md)| The request body for minting tokens. | 

### Return type

[**TokenizationOperationResponse**](TokenizationOperationResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## pauseTokenization

> TokenizationOperationResponse pauseTokenization(token_id, opts)

Pause token contract

This operation pauses the token contract, temporarily halting token operations and transfers. 

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
const apiInstance = new CoboWaas2.TokenizationApi();
const token_id = "ETH_USDT";
const opts = {
  'TokenizationPauseTokenRequest': new CoboWaas2.TokenizationPauseTokenRequest()
};
apiInstance.pauseTokenization(token_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **token_id** | **String**| The token ID, which is the unique identifier of a token. | 
 **TokenizationPauseTokenRequest** | [**TokenizationPauseTokenRequest**](TokenizationPauseTokenRequest.md)| The request body for pausing tokens. | [optional] 

### Return type

[**TokenizationOperationResponse**](TokenizationOperationResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## tokenizationContractCall

> TokenizationOperationResponse tokenizationContractCall(token_id, opts)

Call token contract

This operation performs a contract call on the token contract. 

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
const apiInstance = new CoboWaas2.TokenizationApi();
const token_id = "ETH_USDT";
const opts = {
  'TokenizationContractCallRequest': new CoboWaas2.TokenizationContractCallRequest()
};
apiInstance.tokenizationContractCall(token_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **token_id** | **String**| The token ID, which is the unique identifier of a token. | 
 **TokenizationContractCallRequest** | [**TokenizationContractCallRequest**](TokenizationContractCallRequest.md)| The request body for contract call. | [optional] 

### Return type

[**TokenizationOperationResponse**](TokenizationOperationResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## unpauseTokenization

> TokenizationOperationResponse unpauseTokenization(token_id, opts)

Unpause token contract

This operation unpauses the token contract, resuming token operations and transfers. 

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
const apiInstance = new CoboWaas2.TokenizationApi();
const token_id = "ETH_USDT";
const opts = {
  'TokenizationUnpauseTokenRequest': new CoboWaas2.TokenizationUnpauseTokenRequest()
};
apiInstance.unpauseTokenization(token_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **token_id** | **String**| The token ID, which is the unique identifier of a token. | 
 **TokenizationUnpauseTokenRequest** | [**TokenizationUnpauseTokenRequest**](TokenizationUnpauseTokenRequest.md)| The request body for unpausing tokens. | [optional] 

### Return type

[**TokenizationOperationResponse**](TokenizationOperationResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## updateTokenizationAllowlistActivation

> TokenizationOperationResponse updateTokenizationAllowlistActivation(token_id, opts)

Activate or deactivate allowlist

This operation activates or deactivates the allowlist. 

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
const apiInstance = new CoboWaas2.TokenizationApi();
const token_id = "ETH_USDT";
const opts = {
  'TokenizationAllowlistActivationRequest': new CoboWaas2.TokenizationAllowlistActivationRequest()
};
apiInstance.updateTokenizationAllowlistActivation(token_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **token_id** | **String**| The token ID, which is the unique identifier of a token. | 
 **TokenizationAllowlistActivationRequest** | [**TokenizationAllowlistActivationRequest**](TokenizationAllowlistActivationRequest.md)| The request body for activating or deactivating the allowlist. | [optional] 

### Return type

[**TokenizationOperationResponse**](TokenizationOperationResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## updateTokenizationAllowlistAddresses

> TokenizationOperationResponse updateTokenizationAllowlistAddresses(token_id, opts)

Update addresses on allowlist

This operation updates addresses on the allowlist. 

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
const apiInstance = new CoboWaas2.TokenizationApi();
const token_id = "ETH_USDT";
const opts = {
  'TokenizationUpdateAllowlistAddressesRequest': new CoboWaas2.TokenizationUpdateAllowlistAddressesRequest()
};
apiInstance.updateTokenizationAllowlistAddresses(token_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **token_id** | **String**| The token ID, which is the unique identifier of a token. | 
 **TokenizationUpdateAllowlistAddressesRequest** | [**TokenizationUpdateAllowlistAddressesRequest**](TokenizationUpdateAllowlistAddressesRequest.md)| The request body for adding or removing multiple addresses on the allowlist. | [optional] 

### Return type

[**TokenizationOperationResponse**](TokenizationOperationResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## updateTokenizationBlocklistAddresses

> TokenizationOperationResponse updateTokenizationBlocklistAddresses(token_id, opts)

Update addresses on blocklist

This operation updates addresses on the blocklist. 

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
const apiInstance = new CoboWaas2.TokenizationApi();
const token_id = "ETH_USDT";
const opts = {
  'TokenizationUpdateBlocklistAddressesRequest': new CoboWaas2.TokenizationUpdateBlocklistAddressesRequest()
};
apiInstance.updateTokenizationBlocklistAddresses(token_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **token_id** | **String**| The token ID, which is the unique identifier of a token. | 
 **TokenizationUpdateBlocklistAddressesRequest** | [**TokenizationUpdateBlocklistAddressesRequest**](TokenizationUpdateBlocklistAddressesRequest.md)| The request body for adding or removing multiple addresses on the blocklist. | [optional] 

### Return type

[**TokenizationOperationResponse**](TokenizationOperationResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## updateTokenizationPermissions

> TokenizationOperationResponse updateTokenizationPermissions(token_id, TokenizationUpdatePermissionsRequest)

Update token permissions

This operation updates permission settings for a tokenization contract. 

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
const apiInstance = new CoboWaas2.TokenizationApi();
const token_id = "ETH_USDT";
const TokenizationUpdatePermissionsRequest = new CoboWaas2.TokenizationUpdatePermissionsRequest();
apiInstance.updateTokenizationPermissions(token_id, TokenizationUpdatePermissionsRequest).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **token_id** | **String**| The token ID, which is the unique identifier of a token. | 
 **TokenizationUpdatePermissionsRequest** | [**TokenizationUpdatePermissionsRequest**](TokenizationUpdatePermissionsRequest.md)| The request body for managing permissions. | 

### Return type

[**TokenizationOperationResponse**](TokenizationOperationResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

