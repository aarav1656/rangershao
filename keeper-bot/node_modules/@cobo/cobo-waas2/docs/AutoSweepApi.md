# CoboWaas2.AutoSweepApi

All URIs are relative to *https://api.dev.cobo.com/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**cancelAutoSweepTaskById**](AutoSweepApi.md#cancelAutoSweepTaskById) | **POST** /auto_sweep/tasks/{task_id}/cancel | Cancel auto sweep task
[**createAutoSweepTask**](AutoSweepApi.md#createAutoSweepTask) | **POST** /auto_sweep/tasks | Create auto-sweep task
[**createWalletSweepToAddresses**](AutoSweepApi.md#createWalletSweepToAddresses) | **POST** /auto_sweep/sweep_to_addresses | Create sweep-to address
[**getAutoSweepTaskById**](AutoSweepApi.md#getAutoSweepTaskById) | **GET** /auto_sweep/tasks/{task_id} | Get auto-sweep task details
[**listAutoSweepTask**](AutoSweepApi.md#listAutoSweepTask) | **GET** /auto_sweep/tasks | List auto-sweep tasks
[**listWalletSweepToAddresses**](AutoSweepApi.md#listWalletSweepToAddresses) | **GET** /auto_sweep/sweep_to_addresses | List sweep-to addresses



## cancelAutoSweepTaskById

> AutoSweepTask cancelAutoSweepTaskById(task_id)

Cancel auto sweep task

This operation cancels an in-progress auto sweep task by its ID.  Only tasks with the &#x60;Submitted&#x60; status can be cancelled. Tasks that have already been processed (status &#x60;TransactionCreated&#x60;) cannot be cancelled. 

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
const apiInstance = new CoboWaas2.AutoSweepApi();
const task_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.cancelAutoSweepTaskById(task_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **task_id** | **String**| The auto sweep task ID. | 

### Return type

[**AutoSweepTask**](AutoSweepTask.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## createAutoSweepTask

> AutoSweepTask createAutoSweepTask(opts)

Create auto-sweep task

This operation creates an auto-sweep task for the specified wallet and token. The task triggers transactions to sweep the full balance of the specified token to the configured sweep-to address. 

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
const apiInstance = new CoboWaas2.AutoSweepApi();
const opts = {
  'CreateAutoSweepTask': new CoboWaas2.CreateAutoSweepTask()
};
apiInstance.createAutoSweepTask(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **CreateAutoSweepTask** | [**CreateAutoSweepTask**](CreateAutoSweepTask.md)| The request body to create an auto-sweep task. | [optional] 

### Return type

[**AutoSweepTask**](AutoSweepTask.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## createWalletSweepToAddresses

> SweepToAddress createWalletSweepToAddresses(opts)

Create sweep-to address

This operation creates a new sweep-to address for the specified wallet. The previously sweep-to address for the same token becomes invalid once the new one is created.  Use this operation to change the sweep-to address when your setup changes, you switch networks, or the current address is compromised or tainted by suspicious funds. You can withdraw any remaining balances from the old sweep-to addresses to the new address or another designated destination.  &lt;Note&gt;Sweep-to addresses are only applicable to MPC Wallets and Custodial Wallets (Web3 Wallets) with the auto-sweep feature enabled.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.AutoSweepApi();
const opts = {
  'CreateSweepToAddress': new CoboWaas2.CreateSweepToAddress()
};
apiInstance.createWalletSweepToAddresses(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **CreateSweepToAddress** | [**CreateSweepToAddress**](CreateSweepToAddress.md)| The request body to generates a new sweep-to address within a specified wallet. | [optional] 

### Return type

[**SweepToAddress**](SweepToAddress.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## getAutoSweepTaskById

> AutoSweepTask getAutoSweepTaskById(task_id)

Get auto-sweep task details

This operation retrieves detailed information about a specified auto-sweep task. 

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
const apiInstance = new CoboWaas2.AutoSweepApi();
const task_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.getAutoSweepTaskById(task_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **task_id** | **String**| The auto sweep task ID. | 

### Return type

[**AutoSweepTask**](AutoSweepTask.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listAutoSweepTask

> ListAutoSweepTask200Response listAutoSweepTask(wallet_id, opts)

List auto-sweep tasks

This operation retrieves a list of auto-sweep tasks for the specified wallet. You can filter the results by token ID, task IDs, or a created-time range. 

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
const apiInstance = new CoboWaas2.AutoSweepApi();
const wallet_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'token_id': "ETH_USDT",
  'task_ids': "f47ac10b-58cc-4372-a567-0e02b2c3d479,1ddca562-8434-41c9-8809-d437bad9c868",
  'min_created_timestamp': 1635744000000,
  'max_created_timestamp': 1635744000000,
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk",
  'direction': "ASC"
};
apiInstance.listAutoSweepTask(wallet_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **wallet_id** | **String**| The wallet ID. | 
 **token_id** | **String**| The token ID, which is the unique identifier of a token. You can retrieve the IDs of all the tokens you can use by calling [List enabled tokens](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-tokens). | [optional] 
 **task_ids** | **String**| A list of auto-sweep task IDs, separated by comma. | [optional] 
 **min_created_timestamp** | **Number**| The time when the transaction was created, in Unix timestamp format, measured in milliseconds. You can use this parameter to filter transactions created on or after the specified time.  If you specify &#x60;min_created_timestamp&#x60; without specifying &#x60;max_created_timestamp&#x60;, &#x60;max_created_timestamp&#x60; is automatically set to &#x60;min_created_timestamp&#x60; + 90 days. If you specify both, the time range cannot exceed 90 days.  If not provided, the default value is 90 days before the current time. This default value is subject to change.  | [optional] 
 **max_created_timestamp** | **Number**| The time when the transaction was created, in Unix timestamp format, measured in milliseconds. You can use this parameter to filter transactions created on or before the specified time.  If you specify &#x60;max_created_timestamp&#x60; without specifying &#x60;min_created_timestamp&#x60;, &#x60;min_created_timestamp&#x60; is automatically set to &#x60;max_created_timestamp&#x60; - 90 days. If you specify both, the time range cannot exceed 90 days.  If not provided, the default value is the current time. This default value is subject to change.  | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 
 **direction** | **String**| The sort direction. Possible values include:   - &#x60;ASC&#x60;: Sort the results in ascending order.   - &#x60;DESC&#x60;: Sort the results in descending order.  | [optional] [default to &#39;ASC&#39;]

### Return type

[**ListAutoSweepTask200Response**](ListAutoSweepTask200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listWalletSweepToAddresses

> ListWalletSweepToAddresses200Response listWalletSweepToAddresses(wallet_id)

List sweep-to addresses

This operation retrieves a list of sweep-to addresses within your wallet.  &lt;Note&gt;Sweep-to addresses are only applicable to MPC Wallets and Custodial Wallets (Web3 Wallets) with the auto-sweep feature enabled.&lt;/Note&gt;  &lt;Info&gt;For EVM-compatible chains (such as Ethereum and BNB Smart Chain), the same address is used across chains. As a result, when listing sweep-to addresses, only one address entry (shown under Ethereum) is returned for all EVM-compatible chains. Separate entries are not returned for each individual EVM chain.&lt;/Info&gt; 

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
const apiInstance = new CoboWaas2.AutoSweepApi();
const wallet_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.listWalletSweepToAddresses(wallet_id).then((data) => {
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

[**ListWalletSweepToAddresses200Response**](ListWalletSweepToAddresses200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

