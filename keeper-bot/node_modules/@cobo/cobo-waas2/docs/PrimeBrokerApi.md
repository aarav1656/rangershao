# CoboWaas2.PrimeBrokerApi

All URIs are relative to *https://api.dev.cobo.com/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**changeGuardPubkey**](PrimeBrokerApi.md#changeGuardPubkey) | **PUT** /prime_broker/user/{user_id}/guard_pubkey | Change Guard pubkey binding
[**createGuardPubkey**](PrimeBrokerApi.md#createGuardPubkey) | **POST** /prime_broker/user/{user_id}/guard_pubkey | Create Guard pubkey binding
[**createPrimeBrokerAddress**](PrimeBrokerApi.md#createPrimeBrokerAddress) | **POST** /prime_broker/user/{user_id}/addresses | Bind addresses to a broker user
[**deleteGuardPubkey**](PrimeBrokerApi.md#deleteGuardPubkey) | **POST** /prime_broker/user/{user_id}/guard_pubkey/delete | Delete Guard pubkey binding
[**queryApprovalStatement**](PrimeBrokerApi.md#queryApprovalStatement) | **GET** /prime_broker/approval_statement/{statement_id} | Query approval statement
[**queryGuardPubkey**](PrimeBrokerApi.md#queryGuardPubkey) | **GET** /prime_broker/user/{user_id}/guard_pubkey | Query a Guard pubkey



## changeGuardPubkey

> ChangeGuardPubkey200Response changeGuardPubkey(user_id)

Change Guard pubkey binding

This operation updates an existing binding to associate a broker user ID with a new Cobo Guard public key. 

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
const apiInstance = new CoboWaas2.PrimeBrokerApi();
const user_id = "168108513539918";
apiInstance.changeGuardPubkey(user_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **user_id** | **String**| The user ID. | 

### Return type

[**ChangeGuardPubkey200Response**](ChangeGuardPubkey200Response.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## createGuardPubkey

> ChangeGuardPubkey200Response createGuardPubkey(user_id)

Create Guard pubkey binding

This operation creates a binding between a broker user ID and a Cobo Guard public key.  

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
const apiInstance = new CoboWaas2.PrimeBrokerApi();
const user_id = "168108513539918";
apiInstance.createGuardPubkey(user_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **user_id** | **String**| The user ID. | 

### Return type

[**ChangeGuardPubkey200Response**](ChangeGuardPubkey200Response.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## createPrimeBrokerAddress

> CreatePrimeBrokerAddress201Response createPrimeBrokerAddress(user_id, opts)

Bind addresses to a broker user

This operation binds addresses to a broker user. 

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
const apiInstance = new CoboWaas2.PrimeBrokerApi();
const user_id = "168108513539918";
const opts = {
  'CreatePrimeBrokerAddressRequest': new CoboWaas2.CreatePrimeBrokerAddressRequest()
};
apiInstance.createPrimeBrokerAddress(user_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **user_id** | **String**| The user ID. | 
 **CreatePrimeBrokerAddressRequest** | [**CreatePrimeBrokerAddressRequest**](CreatePrimeBrokerAddressRequest.md)| The request body to bind addresses to a broker user. | [optional] 

### Return type

[**CreatePrimeBrokerAddress201Response**](CreatePrimeBrokerAddress201Response.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## deleteGuardPubkey

> DeleteGuardPubkey201Response deleteGuardPubkey(user_id)

Delete Guard pubkey binding

This operation deletes a binding between a broker user ID and a Cobo Guard public key. 

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
const apiInstance = new CoboWaas2.PrimeBrokerApi();
const user_id = "168108513539918";
apiInstance.deleteGuardPubkey(user_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **user_id** | **String**| The user ID. | 

### Return type

[**DeleteGuardPubkey201Response**](DeleteGuardPubkey201Response.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## queryApprovalStatement

> QueryApprovalStatement200Response queryApprovalStatement(statement_id)

Query approval statement

This operation queries an approval statement. 

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
const apiInstance = new CoboWaas2.PrimeBrokerApi();
const statement_id = "168108513539918";
apiInstance.queryApprovalStatement(statement_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **statement_id** | **String**| The approval statement ID. | 

### Return type

[**QueryApprovalStatement200Response**](QueryApprovalStatement200Response.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## queryGuardPubkey

> QueryGuardPubkey200Response queryGuardPubkey(user_id)

Query a Guard pubkey

This operation retrieves the current Cobo Guard public key binding details for a broker user. 

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
const apiInstance = new CoboWaas2.PrimeBrokerApi();
const user_id = "168108513539918";
apiInstance.queryGuardPubkey(user_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **user_id** | **String**| The user ID. | 

### Return type

[**QueryGuardPubkey200Response**](QueryGuardPubkey200Response.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

