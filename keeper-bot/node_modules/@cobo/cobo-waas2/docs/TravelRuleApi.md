# CoboWaas2.TravelRuleApi

All URIs are relative to *https://api.dev.cobo.com/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getTransactionLimitation**](TravelRuleApi.md#getTransactionLimitation) | **GET** /travel_rule/transaction/limitation | Retrieve transaction limitations
[**listSupportedCountries**](TravelRuleApi.md#listSupportedCountries) | **GET** /travel_rule/transaction/countries | List supported countries
[**submitDepositTravelRuleInfo**](TravelRuleApi.md#submitDepositTravelRuleInfo) | **POST** /travel_rule/transaction/deposit/travel_rule_info | Submit Travel Rule information for deposits
[**submitWithdrawTravelRuleInfo**](TravelRuleApi.md#submitWithdrawTravelRuleInfo) | **POST** /travel_rule/transaction/withdraw/travel_rule_info | Submit Travel Rule information for withdrawals



## getTransactionLimitation

> GetTransactionLimitation200Response getTransactionLimitation(transaction_type, transaction_id)

Retrieve transaction limitations

This operation retrieves Travel Rule requirements and available options for a transaction based on its transaction type and ID.  Use this endpoint before submitting Travel Rule information to understand the requirements and available options for your transaction. 

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
const apiInstance = new CoboWaas2.TravelRuleApi();
const transaction_type = "DEPOSIT";
const transaction_id = "123e4567-e89b-12d3-a456-426614174000";
apiInstance.getTransactionLimitation(transaction_type, transaction_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **transaction_type** | **String**| The transaction type. Possible values include:    - &#x60;DEPOSIT&#x60;: A deposit transaction.   - &#x60;WITHDRAW&#x60;: A withdrawal transaction.  | 
 **transaction_id** | **String**| The transaction ID. | 

### Return type

[**GetTransactionLimitation200Response**](GetTransactionLimitation200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listSupportedCountries

> [ListSupportedCountries200ResponseInner] listSupportedCountries()

List supported countries

This operation retrieves a list of supported countries that can be used when submitting Travel Rule information.  Use this endpoint to obtain valid country values for:   - Place of incorporation of a legal entity   - Place of birth of a natural person 

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
const apiInstance = new CoboWaas2.TravelRuleApi();
apiInstance.listSupportedCountries().then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

This endpoint does not need any parameter.

### Return type

[**[ListSupportedCountries200ResponseInner]**](ListSupportedCountries200ResponseInner.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## submitDepositTravelRuleInfo

> SubmitDepositTravelRuleInfo201Response submitDepositTravelRuleInfo(opts)

Submit Travel Rule information for deposits

This operation submits Travel Rule information for a deposit transaction. 

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
const apiInstance = new CoboWaas2.TravelRuleApi();
const opts = {
  'TravelRuleDepositRequest': new CoboWaas2.TravelRuleDepositRequest()
};
apiInstance.submitDepositTravelRuleInfo(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **TravelRuleDepositRequest** | [**TravelRuleDepositRequest**](TravelRuleDepositRequest.md)|  | [optional] 

### Return type

[**SubmitDepositTravelRuleInfo201Response**](SubmitDepositTravelRuleInfo201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## submitWithdrawTravelRuleInfo

> SubmitDepositTravelRuleInfo201Response submitWithdrawTravelRuleInfo(opts)

Submit Travel Rule information for withdrawals

This operation submits Travel Rule information for a withdrawal transaction. 

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
const apiInstance = new CoboWaas2.TravelRuleApi();
const opts = {
  'TravelRuleWithdrawRequest': new CoboWaas2.TravelRuleWithdrawRequest()
};
apiInstance.submitWithdrawTravelRuleInfo(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **TravelRuleWithdrawRequest** | [**TravelRuleWithdrawRequest**](TravelRuleWithdrawRequest.md)|  | [optional] 

### Return type

[**SubmitDepositTravelRuleInfo201Response**](SubmitDepositTravelRuleInfo201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

