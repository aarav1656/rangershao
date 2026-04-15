# CoboWaas2.GraphQLApi

All URIs are relative to *https://api.dev.cobo.com/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**executeGraphql**](GraphQLApi.md#executeGraphql) | **POST** /graphql | Execute a GraphQL query or mutation



## executeGraphql

> GraphQLResponse executeGraphql(opts)

Execute a GraphQL query or mutation

This endpoint executes a GraphQL query or mutation. The request body must include a valid GraphQL query string. 

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
const apiInstance = new CoboWaas2.GraphQLApi();
const opts = {
  'GraphQLRequest': new CoboWaas2.GraphQLRequest()
};
apiInstance.executeGraphql(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **GraphQLRequest** | [**GraphQLRequest**](GraphQLRequest.md)| The request body to generate addresses within a specified wallet. | [optional] 

### Return type

[**GraphQLResponse**](GraphQLResponse.md)

### Authorization

[CoboNonce](../README.md#CoboNonce), [OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth), [CoboSignature](../README.md#CoboSignature)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

