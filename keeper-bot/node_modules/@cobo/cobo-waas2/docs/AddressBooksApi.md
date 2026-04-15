# CoboWaas2.AddressBooksApi

All URIs are relative to *https://api.dev.cobo.com/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createAddressBooks**](AddressBooksApi.md#createAddressBooks) | **POST** /address_books | Create Address Book entries
[**deleteAddressBookById**](AddressBooksApi.md#deleteAddressBookById) | **POST** /address_books/{entry_id}/delete | Delete Address Book entry
[**getAddressBookById**](AddressBooksApi.md#getAddressBookById) | **GET** /address_books/{entry_id} | Get Address Book entry
[**listAddressBooks**](AddressBooksApi.md#listAddressBooks) | **GET** /address_books | List Address Book entries
[**updateAddressBookById**](AddressBooksApi.md#updateAddressBookById) | **PUT** /address_books/{entry_id} | Update Address Book entry



## createAddressBooks

> CreateAddressBooks201Response createAddressBooks(opts)

Create Address Book entries

This operation adds new entries (records) to your Address Book. &lt;Note&gt;This operation is available upon request. Please contact our [customer support](mailto:help@cobo.com) to enable it.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.AddressBooksApi();
const opts = {
  'CreateAddressBooksParam': new CoboWaas2.CreateAddressBooksParam()
};
apiInstance.createAddressBooks(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **CreateAddressBooksParam** | [**CreateAddressBooksParam**](CreateAddressBooksParam.md)| The request body of the create Address Books operation. | [optional] 

### Return type

[**CreateAddressBooks201Response**](CreateAddressBooks201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## deleteAddressBookById

> DeleteAddressBookById201Response deleteAddressBookById(entry_id)

Delete Address Book entry

This operation deletes a specified Address Book entry (record). &lt;Note&gt;This operation is available upon request. Please contact our [customer support](mailto:help@cobo.com) to enable it.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.AddressBooksApi();
const entry_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.deleteAddressBookById(entry_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **entry_id** | **String**| The Address Book entry ID. | 

### Return type

[**DeleteAddressBookById201Response**](DeleteAddressBookById201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getAddressBookById

> AddressBook getAddressBookById(entry_id)

Get Address Book entry

This operation retrieves the detailed information about a specified Address Book entry (record). 

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
const apiInstance = new CoboWaas2.AddressBooksApi();
const entry_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.getAddressBookById(entry_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **entry_id** | **String**| The Address Book entry ID. | 

### Return type

[**AddressBook**](AddressBook.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listAddressBooks

> ListAddressBooks200Response listAddressBooks(opts)

List Address Book entries

This operation retrieves all entries (records) from your Address Book. You can filter the entries by chain ID, address, and label. 

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
const apiInstance = new CoboWaas2.AddressBooksApi();
const opts = {
  'chain_id': "ETH",
  'address': "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  'label': "test",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listAddressBooks(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **chain_id** | **String**| The chain ID, which is the unique identifier of a blockchain. You can retrieve the IDs of all the chains you can use by calling [List enabled chains](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-chains). | [optional] 
 **address** | **String**|  | [optional] 
 **label** | **String**| A user-defined label for the address. | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListAddressBooks200Response**](ListAddressBooks200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## updateAddressBookById

> AddressBook updateAddressBookById(entry_id, opts)

Update Address Book entry

This operation updates the information of a specified Address Book entry (record). &lt;Note&gt;This operation is available upon request. Please contact our [customer support](mailto:help@cobo.com) to enable it.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.AddressBooksApi();
const entry_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'UpdateAddressBookParam': new CoboWaas2.UpdateAddressBookParam()
};
apiInstance.updateAddressBookById(entry_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **entry_id** | **String**| The Address Book entry ID. | 
 **UpdateAddressBookParam** | [**UpdateAddressBookParam**](UpdateAddressBookParam.md)| The request body of the update Address Book operation. | [optional] 

### Return type

[**AddressBook**](AddressBook.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

