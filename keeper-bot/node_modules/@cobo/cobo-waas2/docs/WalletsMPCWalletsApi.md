# CoboWaas2.WalletsMPCWalletsApi

All URIs are relative to *https://api.dev.cobo.com/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**cancelTssRequestById**](WalletsMPCWalletsApi.md#cancelTssRequestById) | **POST** /wallets/mpc/vaults/{vault_id}/tss_requests/{tss_request_id}/cancel | Cancel TSS request
[**createKeyShareHolderGroup**](WalletsMPCWalletsApi.md#createKeyShareHolderGroup) | **POST** /wallets/mpc/vaults/{vault_id}/key_share_holder_groups | Create key share holder group
[**createMpcProject**](WalletsMPCWalletsApi.md#createMpcProject) | **POST** /wallets/mpc/projects | Create project
[**createMpcVault**](WalletsMPCWalletsApi.md#createMpcVault) | **POST** /wallets/mpc/vaults | Create vault
[**createTssRequest**](WalletsMPCWalletsApi.md#createTssRequest) | **POST** /wallets/mpc/vaults/{vault_id}/tss_requests | Create TSS request
[**deleteKeyShareHolderGroupById**](WalletsMPCWalletsApi.md#deleteKeyShareHolderGroupById) | **POST** /wallets/mpc/vaults/{vault_id}/key_share_holder_groups/{key_share_holder_group_id}/delete | Delete key share holder group
[**getKeyShareHolderByTssNodeId**](WalletsMPCWalletsApi.md#getKeyShareHolderByTssNodeId) | **GET** /wallets/mpc/vaults/{vault_id}/key_share_holders/{tss_node_id} | Get key share holder information
[**getKeyShareHolderGroupById**](WalletsMPCWalletsApi.md#getKeyShareHolderGroupById) | **GET** /wallets/mpc/vaults/{vault_id}/key_share_holder_groups/{key_share_holder_group_id} | Get key share holder group information
[**getMpcProjectById**](WalletsMPCWalletsApi.md#getMpcProjectById) | **GET** /wallets/mpc/projects/{project_id} | Get project information
[**getMpcVaultById**](WalletsMPCWalletsApi.md#getMpcVaultById) | **GET** /wallets/mpc/vaults/{vault_id} | Get vault information
[**getTssRequestById**](WalletsMPCWalletsApi.md#getTssRequestById) | **GET** /wallets/mpc/vaults/{vault_id}/tss_requests/{tss_request_id} | Get TSS request
[**listCoboKeyHolders**](WalletsMPCWalletsApi.md#listCoboKeyHolders) | **GET** /wallets/mpc/cobo_key_share_holders | List all Cobo key share holders
[**listKeyShareHolderGroups**](WalletsMPCWalletsApi.md#listKeyShareHolderGroups) | **GET** /wallets/mpc/vaults/{vault_id}/key_share_holder_groups | List all key share holder groups
[**listKeyShareHolders**](WalletsMPCWalletsApi.md#listKeyShareHolders) | **GET** /wallets/mpc/vaults/{vault_id}/key_share_holders | List all key share holders
[**listMpcProjects**](WalletsMPCWalletsApi.md#listMpcProjects) | **GET** /wallets/mpc/projects | List all projects
[**listMpcVaults**](WalletsMPCWalletsApi.md#listMpcVaults) | **GET** /wallets/mpc/vaults | List all vaults
[**listTssRequests**](WalletsMPCWalletsApi.md#listTssRequests) | **GET** /wallets/mpc/vaults/{vault_id}/tss_requests | List TSS requests
[**updateKeyShareHolderGroupById**](WalletsMPCWalletsApi.md#updateKeyShareHolderGroupById) | **PUT** /wallets/mpc/vaults/{vault_id}/key_share_holder_groups/{key_share_holder_group_id} | Update key share holder group
[**updateMpcProjectById**](WalletsMPCWalletsApi.md#updateMpcProjectById) | **PUT** /wallets/mpc/projects/{project_id} | Update project name
[**updateMpcVaultById**](WalletsMPCWalletsApi.md#updateMpcVaultById) | **PUT** /wallets/mpc/vaults/{vault_id} | Update vault name



## cancelTssRequestById

> TSSRequest cancelTssRequestById(vault_id, tss_request_id)

Cancel TSS request

This operation cancels a TSS request. 

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
const apiInstance = new CoboWaas2.WalletsMPCWalletsApi();
const vault_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const tss_request_id = "20240711114129000132315000003970";
apiInstance.cancelTssRequestById(vault_id, tss_request_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **vault_id** | **String**| The vault ID, which you can retrieve by calling [List all vaults](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-vaults). | 
 **tss_request_id** | **String**| The TSS request ID, which you can retrieve by calling [List TSS requests](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-tss-requests). | 

### Return type

[**TSSRequest**](TSSRequest.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## createKeyShareHolderGroup

> KeyShareHolderGroup createKeyShareHolderGroup(vault_id, opts)

Create key share holder group

This operation creates a key share holder group for a specified vault. &lt;Note&gt;This operation will not return the &#x60;tss_key_share_groups&#x60; property until key shares have been created using the [Create TSS request](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/create-tss-request) operation. Creating a wallet with the [Create wallet](https://www.cobo.com/developers/v2/api-references/wallets/create-wallet) operation is only possible after you&#39;ve completed the previous actions.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.WalletsMPCWalletsApi();
const vault_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'CreateKeyShareHolderGroupRequest': new CoboWaas2.CreateKeyShareHolderGroupRequest()
};
apiInstance.createKeyShareHolderGroup(vault_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **vault_id** | **String**| The vault ID, which you can retrieve by calling [List all vaults](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-vaults). | 
 **CreateKeyShareHolderGroupRequest** | [**CreateKeyShareHolderGroupRequest**](CreateKeyShareHolderGroupRequest.md)| The request body to create a key share holder group. | [optional] 

### Return type

[**KeyShareHolderGroup**](KeyShareHolderGroup.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## createMpcProject

> MPCProject createMpcProject(opts)

Create project

This operation creates a project.  &lt;Note&gt;This operation applies to MPC Wallets (User-Controlled Wallets) only.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.WalletsMPCWalletsApi();
const opts = {
  'CreateMpcProjectRequest': new CoboWaas2.CreateMpcProjectRequest()
};
apiInstance.createMpcProject(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **CreateMpcProjectRequest** | [**CreateMpcProjectRequest**](CreateMpcProjectRequest.md)| The request body to create a project. | [optional] 

### Return type

[**MPCProject**](MPCProject.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## createMpcVault

> MPCVault createMpcVault(opts)

Create vault

This operation creates a vault.  &lt;Info&gt;To learn what a vault is and how it relates to MPC Wallets, see [Get started with MPC Wallets](https://www.cobo.com/developers/v2/guides/mpc-wallets/get-started-ocw#technical-architecture).&lt;/Info&gt; 

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
const apiInstance = new CoboWaas2.WalletsMPCWalletsApi();
const opts = {
  'CreateMpcVaultRequest': new CoboWaas2.CreateMpcVaultRequest()
};
apiInstance.createMpcVault(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **CreateMpcVaultRequest** | [**CreateMpcVaultRequest**](CreateMpcVaultRequest.md)| The request body to create a vault. | [optional] 

### Return type

[**MPCVault**](MPCVault.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## createTssRequest

> TSSRequest createTssRequest(vault_id, opts)

Create TSS request

This operation creates a TSS request under a specified vault. You can use this operation to perform actions such as key generation and recovery. 

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
const apiInstance = new CoboWaas2.WalletsMPCWalletsApi();
const vault_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'CreateTssRequestRequest': new CoboWaas2.CreateTssRequestRequest()
};
apiInstance.createTssRequest(vault_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **vault_id** | **String**| The vault ID, which you can retrieve by calling [List all vaults](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-vaults). | 
 **CreateTssRequestRequest** | [**CreateTssRequestRequest**](CreateTssRequestRequest.md)| The request body to create a TSS request. | [optional] 

### Return type

[**TSSRequest**](TSSRequest.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## deleteKeyShareHolderGroupById

> DeleteKeyShareHolderGroupById201Response deleteKeyShareHolderGroupById(vault_id, key_share_holder_group_id)

Delete key share holder group

This operation deletes a specified key share holder group.

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
const apiInstance = new CoboWaas2.WalletsMPCWalletsApi();
const vault_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const key_share_holder_group_id = "e8257ac8-76b8-4d1e-a1f9-eec4cb931dce";
apiInstance.deleteKeyShareHolderGroupById(vault_id, key_share_holder_group_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **vault_id** | **String**| The vault ID, which you can retrieve by calling [List all vaults](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-vaults). | 
 **key_share_holder_group_id** | **String**| The key share holder group ID. | 

### Return type

[**DeleteKeyShareHolderGroupById201Response**](DeleteKeyShareHolderGroupById201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getKeyShareHolderByTssNodeId

> KeyShareHolder getKeyShareHolderByTssNodeId(vault_id, tss_node_id)

Get key share holder information

This operation retrieves detailed information about a specified key share holder. 

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
const apiInstance = new CoboWaas2.WalletsMPCWalletsApi();
const vault_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const tss_node_id = "coboBTGDvjJG99pABegvPYmavrcTU3SkjTLHVdsko8dWBga4w";
apiInstance.getKeyShareHolderByTssNodeId(vault_id, tss_node_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **vault_id** | **String**| The vault ID, which you can retrieve by calling [List all vaults](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-vaults). | 
 **tss_node_id** | **String**| The TSS Node ID. | 

### Return type

[**KeyShareHolder**](KeyShareHolder.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getKeyShareHolderGroupById

> KeyShareHolderGroup getKeyShareHolderGroupById(vault_id, key_share_holder_group_id)

Get key share holder group information

This operation retrieves detailed information about a specified key share holder group. 

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
const apiInstance = new CoboWaas2.WalletsMPCWalletsApi();
const vault_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const key_share_holder_group_id = "e8257ac8-76b8-4d1e-a1f9-eec4cb931dce";
apiInstance.getKeyShareHolderGroupById(vault_id, key_share_holder_group_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **vault_id** | **String**| The vault ID, which you can retrieve by calling [List all vaults](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-vaults). | 
 **key_share_holder_group_id** | **String**| The key share holder group ID. | 

### Return type

[**KeyShareHolderGroup**](KeyShareHolderGroup.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getMpcProjectById

> MPCProject getMpcProjectById(project_id)

Get project information

This operation retrieves detailed information about a project. &lt;Note&gt;This operation applies to MPC Wallets (User-Controlled Wallets) only.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.WalletsMPCWalletsApi();
const project_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.getMpcProjectById(project_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **String**| The project ID, which you can retrieve by calling [List all projects](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-projects). | 

### Return type

[**MPCProject**](MPCProject.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getMpcVaultById

> MPCVault getMpcVaultById(vault_id)

Get vault information

This operation retrieves detailed information about a vault.  &lt;Info&gt;To learn what a vault is and how it relates to MPC Wallets, see [Get started with MPC Wallets](https://www.cobo.com/developers/v2/guides/mpc-wallets/get-started-ocw#technical-architecture).&lt;/Info&gt; 

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
const apiInstance = new CoboWaas2.WalletsMPCWalletsApi();
const vault_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.getMpcVaultById(vault_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **vault_id** | **String**| The vault ID, which you can retrieve by calling [List all vaults](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-vaults). | 

### Return type

[**MPCVault**](MPCVault.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getTssRequestById

> TSSRequest getTssRequestById(vault_id, tss_request_id)

Get TSS request

This operation retrieves detailed information about a TSS request. 

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
const apiInstance = new CoboWaas2.WalletsMPCWalletsApi();
const vault_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const tss_request_id = "20240711114129000132315000003970";
apiInstance.getTssRequestById(vault_id, tss_request_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **vault_id** | **String**| The vault ID, which you can retrieve by calling [List all vaults](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-vaults). | 
 **tss_request_id** | **String**| The TSS request ID, which you can retrieve by calling [List TSS requests](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-tss-requests). | 

### Return type

[**TSSRequest**](TSSRequest.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listCoboKeyHolders

> [KeyShareHolder] listCoboKeyHolders()

List all Cobo key share holders

This operation retrieves a list of all Cobo key share holders and their information.   &lt;Info&gt;When using this operation, &#x60;type&#x60; will only return &#x60;Cobo&#x60; and will never return &#x60;Mobile&#x60; or &#x60;API&#x60;.&lt;/Info&gt; 

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
const apiInstance = new CoboWaas2.WalletsMPCWalletsApi();
apiInstance.listCoboKeyHolders().then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

This endpoint does not need any parameter.

### Return type

[**[KeyShareHolder]**](KeyShareHolder.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listKeyShareHolderGroups

> ListKeyShareHolderGroups200Response listKeyShareHolderGroups(vault_id, opts)

List all key share holder groups

This operation retrieves all key share holder groups under a specified vault. You can filter the result by group type. 

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
const apiInstance = new CoboWaas2.WalletsMPCWalletsApi();
const vault_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'key_share_holder_group_type': new CoboWaas2.KeyShareHolderGroupType(),
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listKeyShareHolderGroups(vault_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **vault_id** | **String**| The vault ID, which you can retrieve by calling [List all vaults](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-vaults). | 
 **key_share_holder_group_type** | [**KeyShareHolderGroupType**](.md)| The key share holder group type. Possible values include: - &#x60;MainGroup&#x60;: The [Main Group](https://manuals.cobo.com/en/portal/mpc-wallets/ocw/create-key-share-groups#main-group).  - &#x60;SigningGroup&#x60;: The [Signing Group](https://manuals.cobo.com/en/portal/mpc-wallets/ocw/create-key-share-groups#signing-group).  - &#x60;RecoveryGroup&#x60;: The [Recovery Group](https://manuals.cobo.com/en/portal/mpc-wallets/ocw/create-key-share-groups#recovery-group).  **Note**: If this parameter is left empty, all key share holder group types will be retrieved.  | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListKeyShareHolderGroups200Response**](ListKeyShareHolderGroups200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listKeyShareHolders

> ListKeyShareHolders200Response listKeyShareHolders(vault_id, opts)

List all key share holders

This operation retrieves a list of all key share holders under a specified vault. You can filter the result by key share holder group ID. 

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
const apiInstance = new CoboWaas2.WalletsMPCWalletsApi();
const vault_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'key_share_holder_group_ids': "dc0cac48-9add-4243-9c7a-b8badac8a198,5558bd1b-d221-4e2b-8c29-f6c97d9e6aca",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listKeyShareHolders(vault_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **vault_id** | **String**| The vault ID, which you can retrieve by calling [List all vaults](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-vaults). | 
 **key_share_holder_group_ids** | **String**| A list of key share holder group IDs, separated by comma. You can retrieve the IDs of all the key share holder groups by calling [List all key share holder groups](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-key-share-holder-groups). | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListKeyShareHolders200Response**](ListKeyShareHolders200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listMpcProjects

> ListMpcProjects200Response listMpcProjects(opts)

List all projects

This operation retrieves a list of all projects.  &lt;Note&gt;This operation applies to MPC Wallets (User-Controlled Wallets) only.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.WalletsMPCWalletsApi();
const opts = {
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listMpcProjects(opts).then((data) => {
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

### Return type

[**ListMpcProjects200Response**](ListMpcProjects200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listMpcVaults

> ListMpcVaults200Response listMpcVaults(vault_type, opts)

List all vaults

This operation retrieves a list of all vaults. You can filter the result by project ID.  **Notes for query parameters**: 1. &#x60;project_id&#x60; is required when &#x60;vault_type&#x60; is set to &#x60;User-Controlled&#x60;. 2. &#x60;project_id&#x60; must be left blank when &#x60;vault_type&#x60; is set to &#x60;Org-Controlled&#x60;.  &lt;Info&gt;To learn what a vault is and how it relates to MPC Wallets, see [Get started with MPC Wallets](https://www.cobo.com/developers/v2/guides/mpc-wallets/get-started-ocw#technical-architecture).&lt;/Info&gt; 

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
const apiInstance = new CoboWaas2.WalletsMPCWalletsApi();
const vault_type = new CoboWaas2.MPCVaultType();
const opts = {
  'project_id': "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listMpcVaults(vault_type, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **vault_type** | [**MPCVaultType**](.md)| The vault type. Possible values include: - &#x60;Org-Controlled&#x60;: This vault is a collection of [Organization-Controlled Wallets](https://manuals.cobo.com/en/portal/mpc-wallets/introduction#organization-controlled-wallets).  - &#x60;User-Controlled&#x60;: This vault is a collection of [User-Controlled Wallets](https://manuals.cobo.com/en/portal/mpc-wallets/introduction#user-controlled-wallets).  | 
 **project_id** | **String**| (This parameter is only applicable to User-Controlled Wallets.) The project ID, which you can retrieve by calling [List all projects](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-projects).  | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListMpcVaults200Response**](ListMpcVaults200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listTssRequests

> ListTssRequests200Response listTssRequests(vault_id, key_share_holder_group_id, opts)

List TSS requests

This operation retrieves a list of TSS requests and their details. 

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
const apiInstance = new CoboWaas2.WalletsMPCWalletsApi();
const vault_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const key_share_holder_group_id = "a3a45e99-5a12-444f-867a-ffe0ebb1bb30";
const opts = {
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listTssRequests(vault_id, key_share_holder_group_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **vault_id** | **String**| The vault ID, which you can retrieve by calling [List all vaults](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-vaults). | 
 **key_share_holder_group_id** | **String**| The key share holder group ID of the TSS request, which you can retrieve by calling [List all key share holder groups](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-key-share-holder-groups). | 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListTssRequests200Response**](ListTssRequests200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## updateKeyShareHolderGroupById

> KeyShareHolderGroup updateKeyShareHolderGroupById(vault_id, key_share_holder_group_id, opts)

Update key share holder group

This operation updates a specified active [Signing Group](https://manuals.cobo.com/en/portal/mpc-wallets/ocw/create-key-share-groups). For example, you can use this operation to upgrade a Signing Group to the [Main Group](https://manuals.cobo.com/en/portal/mpc-wallets/ocw/create-key-share-groups). 

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
const apiInstance = new CoboWaas2.WalletsMPCWalletsApi();
const vault_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const key_share_holder_group_id = "e8257ac8-76b8-4d1e-a1f9-eec4cb931dce";
const opts = {
  'UpdateKeyShareHolderGroupByIdRequest': new CoboWaas2.UpdateKeyShareHolderGroupByIdRequest()
};
apiInstance.updateKeyShareHolderGroupById(vault_id, key_share_holder_group_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **vault_id** | **String**| The vault ID, which you can retrieve by calling [List all vaults](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-vaults). | 
 **key_share_holder_group_id** | **String**| The key share holder group ID. | 
 **UpdateKeyShareHolderGroupByIdRequest** | [**UpdateKeyShareHolderGroupByIdRequest**](UpdateKeyShareHolderGroupByIdRequest.md)|  | [optional] 

### Return type

[**KeyShareHolderGroup**](KeyShareHolderGroup.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## updateMpcProjectById

> MPCProject updateMpcProjectById(project_id, opts)

Update project name

This operation updates a project&#39;s name.  &lt;Note&gt;This operation applies to MPC Wallets (User-Controlled Wallets) only.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.WalletsMPCWalletsApi();
const project_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'UpdateMpcProjectByIdRequest': new CoboWaas2.UpdateMpcProjectByIdRequest()
};
apiInstance.updateMpcProjectById(project_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **project_id** | **String**| The project ID, which you can retrieve by calling [List all projects](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-projects). | 
 **UpdateMpcProjectByIdRequest** | [**UpdateMpcProjectByIdRequest**](UpdateMpcProjectByIdRequest.md)| The request body to update a project&#39;s name. | [optional] 

### Return type

[**MPCProject**](MPCProject.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## updateMpcVaultById

> MPCVault updateMpcVaultById(vault_id, opts)

Update vault name

This operation updates a vault&#39;s name.  &lt;Info&gt;To learn what a vault is and how it relates to MPC Wallets, see [Get started with MPC Wallets](https://www.cobo.com/developers/v2/guides/mpc-wallets/get-started-ocw#technical-architecture).&lt;/Info&gt; 

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
const apiInstance = new CoboWaas2.WalletsMPCWalletsApi();
const vault_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'UpdateMpcVaultByIdRequest': new CoboWaas2.UpdateMpcVaultByIdRequest()
};
apiInstance.updateMpcVaultById(vault_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **vault_id** | **String**| The vault ID, which you can retrieve by calling [List all vaults](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-vaults). | 
 **UpdateMpcVaultByIdRequest** | [**UpdateMpcVaultByIdRequest**](UpdateMpcVaultByIdRequest.md)| The request body to update a vault&#39;s name. | [optional] 

### Return type

[**MPCVault**](MPCVault.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

