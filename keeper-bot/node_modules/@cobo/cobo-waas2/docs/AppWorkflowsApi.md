# CoboWaas2.AppWorkflowsApi

All URIs are relative to *https://api.dev.cobo.com/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createApprovalRequest**](AppWorkflowsApi.md#createApprovalRequest) | **POST** /app/workflows/approval_requests | Request workflow approval
[**getApprovalRequestById**](AppWorkflowsApi.md#getApprovalRequestById) | **GET** /app/workflows/approval_requests/{approval_id} | Get approval request details
[**listAppWorkflows**](AppWorkflowsApi.md#listAppWorkflows) | **GET** /app/workflows | List app workflows
[**listApprovalRequests**](AppWorkflowsApi.md#listApprovalRequests) | **GET** /app/workflows/approval_requests | List approval requests
[**revokeApprovalRequest**](AppWorkflowsApi.md#revokeApprovalRequest) | **POST** /app/workflows/approval_requests/{approval_id}/revoke | Revoke approval request



## createApprovalRequest

> CreateApprovalRequest201Response createApprovalRequest(opts)

Request workflow approval

This operation triggers a specified workflow and generates a new approval request.  &lt;Note&gt;To use the approval workflow operations, you must use the Cobo OAuth authentication method ([Org Access Token](https://www.cobo.com/developers/v2/apps/org-access-tokens)).&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.AppWorkflowsApi();
const opts = {
  'RequestApproval': new CoboWaas2.RequestApproval()
};
apiInstance.createApprovalRequest(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **RequestApproval** | [**RequestApproval**](RequestApproval.md)| The request body to request workflow approval. | [optional] 

### Return type

[**CreateApprovalRequest201Response**](CreateApprovalRequest201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## getApprovalRequestById

> ApprovalRequestDetail getApprovalRequestById(approval_id)

Get approval request details

This operation retrieves the details of a specific approval request.  &lt;Note&gt;To use the approval workflow operations, you must use the Cobo OAuth authentication method ([Org Access Token](https://www.cobo.com/developers/v2/apps/org-access-tokens)).&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.AppWorkflowsApi();
const approval_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.getApprovalRequestById(approval_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **approval_id** | **String**| The system-generated unique ID of the approval request. | 

### Return type

[**ApprovalRequestDetail**](ApprovalRequestDetail.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listAppWorkflows

> [AppWorkflow] listAppWorkflows()

List app workflows

This operation retrieves all approval workflows of an Cobo Portal App. &lt;Note&gt;You need to [configure approval workflow](https://www.cobo.com/developers/v2/apps/configure-workflow) in the app Manifest file first.&lt;/Note&gt; &lt;Note&gt;To use the approval workflow operations, you must use the Cobo OAuth authentication method ([Org Access Token](https://www.cobo.com/developers/v2/apps/org-access-tokens)).&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.AppWorkflowsApi();
apiInstance.listAppWorkflows().then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

This endpoint does not need any parameter.

### Return type

[**[AppWorkflow]**](AppWorkflow.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listApprovalRequests

> ListApprovalRequests200Response listApprovalRequests(operation_id, opts)

List approval requests

This operation retrieves a list of approval requests.  &lt;Note&gt;To use the approval workflow operations, you must use the Cobo OAuth authentication method ([Org Access Token](https://www.cobo.com/developers/v2/apps/org-access-tokens)).&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.AppWorkflowsApi();
const operation_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listApprovalRequests(operation_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **operation_id** | **String**| The unique ID of the approval workflow. | 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListApprovalRequests200Response**](ListApprovalRequests200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## revokeApprovalRequest

> RevokeApprovalRequest201Response revokeApprovalRequest(approval_id, opts)

Revoke approval request

This operation revokes a pending approval request.  &lt;Note&gt;To use the approval workflow operations, you must use the Cobo OAuth authentication method ([Org Access Token](https://www.cobo.com/developers/v2/apps/org-access-tokens)).&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.AppWorkflowsApi();
const approval_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'RevokeApprovalRequestRequest': new CoboWaas2.RevokeApprovalRequestRequest()
};
apiInstance.revokeApprovalRequest(approval_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **approval_id** | **String**| The system-generated unique ID of the approval request. | 
 **RevokeApprovalRequestRequest** | [**RevokeApprovalRequestRequest**](RevokeApprovalRequestRequest.md)| The request body to revoke an approval request. | [optional] 

### Return type

[**RevokeApprovalRequest201Response**](RevokeApprovalRequest201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

