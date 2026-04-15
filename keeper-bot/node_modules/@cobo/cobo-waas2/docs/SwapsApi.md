# CoboWaas2.SwapsApi

All URIs are relative to *https://api.dev.cobo.com/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createSwapActivity**](SwapsApi.md#createSwapActivity) | **POST** /swaps/swap | Create swap activity
[**estimateSwapFee**](SwapsApi.md#estimateSwapFee) | **POST** /swaps/estimate_fee | Estimate swap fee
[**getSwapActivity**](SwapsApi.md#getSwapActivity) | **GET** /swaps/activities/{activity_id} | Get swap activity
[**getSwapQuote**](SwapsApi.md#getSwapQuote) | **GET** /swaps/quote | Get swap quote
[**listSwapActivities**](SwapsApi.md#listSwapActivities) | **GET** /swaps/activities | List swap activities
[**listSwapEnabledTokens**](SwapsApi.md#listSwapEnabledTokens) | **GET** /swaps/enabled_tokens | List enabled tokens for swap



## createSwapActivity

> SwapActivityDetail createSwapActivity(CreateSwapActivityRequest)

Create swap activity

This operation creates a swap activity. A swap activity can be either a bridge (cross-chain transfer) or an exchange (token-to-token swap on the same chain). 

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
const apiInstance = new CoboWaas2.SwapsApi();
const CreateSwapActivityRequest = new CoboWaas2.CreateSwapActivityRequest();
apiInstance.createSwapActivity(CreateSwapActivityRequest).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **CreateSwapActivityRequest** | [**CreateSwapActivityRequest**](CreateSwapActivityRequest.md)| The request body for creating a swap activity. | 

### Return type

[**SwapActivityDetail**](SwapActivityDetail.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## estimateSwapFee

> EstimatedFee estimateSwapFee(SwapEstimateFee)

Estimate swap fee

This operation estimates the network fee of a swap activity. You can use this operation to estimate the network fee before initiating swap activities from MPC Wallets or Custodial Wallets (Web3 Wallets).  It requires a valid &#x60;wallet_id&#x60; and &#x60;quote_id&#x60;, so you need to [get a swap quote](https://www.cobo.com/developers/v2/api-references/swaps/get-swap-quote) first. 

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
const apiInstance = new CoboWaas2.SwapsApi();
const SwapEstimateFee = new CoboWaas2.SwapEstimateFee();
apiInstance.estimateSwapFee(SwapEstimateFee).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **SwapEstimateFee** | [**SwapEstimateFee**](SwapEstimateFee.md)| The request body for estimating the network fee of a swap activity. | 

### Return type

[**EstimatedFee**](EstimatedFee.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## getSwapActivity

> SwapActivityDetail getSwapActivity(activity_id)

Get swap activity

This operation retrieves detailed information about a specified swap activity. 

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
const apiInstance = new CoboWaas2.SwapsApi();
const activity_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.getSwapActivity(activity_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **activity_id** | **String**| The unique identifier of the swap activity. | 

### Return type

[**SwapActivityDetail**](SwapActivityDetail.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getSwapQuote

> SwapQuote getSwapQuote(wallet_id, pay_token_id, receive_token_id, opts)

Get swap quote

This operation retrieves the current market exchange rate and estimated service fee. You need to provide &#x60;wallet_id&#x60;, &#x60;pay_token_id&#x60;, and &#x60;receive_token_id&#x60;, along with either &#x60;pay_amount&#x60; or &#x60;receive_amount&#x60;. 

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
const apiInstance = new CoboWaas2.SwapsApi();
const wallet_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const pay_token_id = "ETH";
const receive_token_id = "USDT";
const opts = {
  'pay_amount': "1.5",
  'receive_amount': "2000"
};
apiInstance.getSwapQuote(wallet_id, pay_token_id, receive_token_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_id** | **String**| The wallet ID. | 
 **pay_token_id** | **String**| The ID of the token to pay. | 
 **receive_token_id** | **String**| The ID of the token to receive. | 
 **pay_amount** | **String**| The amount of the token to pay. | [optional] 
 **receive_amount** | **String**| The amount of the token to receive. | [optional] 

### Return type

[**SwapQuote**](SwapQuote.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listSwapActivities

> ListSwapActivities200Response listSwapActivities(opts)

List swap activities

This operation retrieves a list of swap activities. You can filter the results by swap type, status, initiator, and time range. 

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
const apiInstance = new CoboWaas2.SwapsApi();
const opts = {
  'request_id': "web_send_by_user_327_1610444045047",
  'type': new CoboWaas2.SwapType(),
  'status': new CoboWaas2.SwapActivityStatus(),
  'min_updated_timestamp': 1635744000000,
  'max_updated_timestamp': 1635744000000,
  'initiator': "steve@example.com",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk",
  'sort_by': "created_timestamp",
  'direction': "ASC"
};
apiInstance.listSwapActivities(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request_id** | **String**| The request ID that is used to track a transaction request. The request ID is provided by you and must be unique within your organization. | [optional] 
 **type** | [**SwapType**](.md)|  | [optional] 
 **status** | [**SwapActivityStatus**](.md)|  | [optional] 
 **min_updated_timestamp** | **Number**| The start time of the query. All swap activities updated after the specified time will be retrieved. The time is in Unix timestamp format, measured in milliseconds. | [optional] 
 **max_updated_timestamp** | **Number**| The end time of the query. All swap activities updated before the specified time will be retrieved. The time is in Unix timestamp format, measured in milliseconds. | [optional] 
 **initiator** | **String**| The initiator of the swap activity. It is optional when creating the activity and defaults to your API key if not specified. | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 
 **sort_by** | **String**| The field to sort the results by.   Possible values include: - &#x60;created_timestamp&#x60;: Sort by the time when the data was created. - &#x60;updated_timestamp&#x60;: Sort by the time when the data was last updated.  | [optional] 
 **direction** | **String**| The sort direction. Possible values include:   - &#x60;ASC&#x60;: Sort the results in ascending order.   - &#x60;DESC&#x60;: Sort the results in descending order.  | [optional] [default to &#39;ASC&#39;]

### Return type

[**ListSwapActivities200Response**](ListSwapActivities200Response.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listSwapEnabledTokens

> ListSwapEnabledTokens200Response listSwapEnabledTokens(opts)

List enabled tokens for swap

This operation retrieves a list of tokens that are enabled for the swap feature. You can filter the results by swap type, asset ID, and chain ID. 

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
const apiInstance = new CoboWaas2.SwapsApi();
const opts = {
  'type': new CoboWaas2.SwapType(),
  'asset_id': "USDT",
  'chain_id': "ETH",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listSwapEnabledTokens(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **type** | [**SwapType**](.md)|  | [optional] 
 **asset_id** | **String**| (This concept applies to Exchange Wallets only) The asset ID. An asset ID is the unique identifier of the asset held within your linked exchange account. | [optional] 
 **chain_id** | **String**| The chain ID, which is the unique identifier of a blockchain. You can retrieve the IDs of all the chains you can use by calling [List enabled chains](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-chains). | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListSwapEnabledTokens200Response**](ListSwapEnabledTokens200Response.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

