# CoboWaas2.WalletsSmartContractWalletsApi

All URIs are relative to *https://api.dev.cobo.com/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**listSafeWalletDelegates**](WalletsSmartContractWalletsApi.md#listSafeWalletDelegates) | **POST** /wallets/{wallet_id}/smart_contracts/delegates | List Delegates



## listSafeWalletDelegates

> [CoboSafeDelegate] listSafeWalletDelegates(wallet_id, opts)

List Delegates

This operation retrieves all available Delegates of a Safe\\{Wallet\\} for a given transfer or contract call request. 

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
const apiInstance = new CoboWaas2.WalletsSmartContractWalletsApi();
const wallet_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'SafeWalletDelegates': new CoboWaas2.SafeWalletDelegates()
};
apiInstance.listSafeWalletDelegates(wallet_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_id** | **String**| The wallet ID. | 
 **SafeWalletDelegates** | [**SafeWalletDelegates**](SafeWalletDelegates.md)| The request body to query the Delegates of a Safe{Wallet}. | [optional] 

### Return type

[**[CoboSafeDelegate]**](CoboSafeDelegate.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

