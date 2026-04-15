# CoboWaas2.DevelopersWebhooksApi

All URIs are relative to *https://api.dev.cobo.com/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createWebhookEndpoint**](DevelopersWebhooksApi.md#createWebhookEndpoint) | **POST** /webhooks/endpoints | Register webhook endpoint
[**getWebhookEndpointById**](DevelopersWebhooksApi.md#getWebhookEndpointById) | **GET** /webhooks/endpoints/{endpoint_id} | Get webhook endpoint information
[**getWebhookEventById**](DevelopersWebhooksApi.md#getWebhookEventById) | **GET** /webhooks/endpoints/{endpoint_id}/events/{event_id} | Retrieve event information
[**listWebhookEndpoints**](DevelopersWebhooksApi.md#listWebhookEndpoints) | **GET** /webhooks/endpoints | List webhook endpoints
[**listWebhookEventDefinitions**](DevelopersWebhooksApi.md#listWebhookEventDefinitions) | **GET** /webhooks/events/definitions | Get webhook event types
[**listWebhookEventLogs**](DevelopersWebhooksApi.md#listWebhookEventLogs) | **GET** /webhooks/endpoints/{endpoint_id}/events/{event_id}/logs | List webhook event logs
[**listWebhookEvents**](DevelopersWebhooksApi.md#listWebhookEvents) | **GET** /webhooks/endpoints/{endpoint_id}/events | List all webhook events
[**retryWebhookEventById**](DevelopersWebhooksApi.md#retryWebhookEventById) | **POST** /webhooks/endpoints/{endpoint_id}/events/{event_id}/retry | Retry event
[**triggerTestWebhookEvent**](DevelopersWebhooksApi.md#triggerTestWebhookEvent) | **POST** /webhooks/events/trigger | Trigger test event
[**updateWebhookEndpointById**](DevelopersWebhooksApi.md#updateWebhookEndpointById) | **PUT** /webhooks/endpoints/{endpoint_id} | Update webhook endpoint



## createWebhookEndpoint

> WebhookEndpoint createWebhookEndpoint(opts)

Register webhook endpoint

This operation registers a new webhook endpoint for your organization.

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
const apiInstance = new CoboWaas2.DevelopersWebhooksApi();
const opts = {
  'CreateWebhookEndpointRequest': new CoboWaas2.CreateWebhookEndpointRequest()
};
apiInstance.createWebhookEndpoint(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **CreateWebhookEndpointRequest** | [**CreateWebhookEndpointRequest**](CreateWebhookEndpointRequest.md)| The request body to register a webhook endpoint. | [optional] 

### Return type

[**WebhookEndpoint**](WebhookEndpoint.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## getWebhookEndpointById

> WebhookEndpoint getWebhookEndpointById(endpoint_id)

Get webhook endpoint information

This operation retrieves the information of a specified webhook endpoint.

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
const apiInstance = new CoboWaas2.DevelopersWebhooksApi();
const endpoint_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.getWebhookEndpointById(endpoint_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **endpoint_id** | **String**| The webhook endpoint ID. You can retrieve a list of webhook endpoint IDs by calling [List webhook endpoints](https://www.cobo.com/developers/v2/api-references/developers--webhooks/list-webhook-endpoints). | 

### Return type

[**WebhookEndpoint**](WebhookEndpoint.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getWebhookEventById

> WebhookEvent getWebhookEventById(event_id, endpoint_id)

Retrieve event information

This operation retrieves the information of a webhook event by the event ID. 

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
const apiInstance = new CoboWaas2.DevelopersWebhooksApi();
const event_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const endpoint_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.getWebhookEventById(event_id, endpoint_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **event_id** | **String**| The event ID. You can obtain a list of event IDs by calling [List all events](https://www.cobo.com/developers/v2/api-references/developers--webhooks/list-all-events). | 
 **endpoint_id** | **String**| The webhook endpoint ID. You can retrieve a list of webhook endpoint IDs by calling [List webhook endpoints](https://www.cobo.com/developers/v2/api-references/developers--webhooks/list-webhook-endpoints). | 

### Return type

[**WebhookEvent**](WebhookEvent.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listWebhookEndpoints

> ListWebhookEndpoints200Response listWebhookEndpoints(opts)

List webhook endpoints

This operation retrieves the information of all webhook endpoints registered under your organization. You can filter the result by endpoint status and the subscribed event type.

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
const apiInstance = new CoboWaas2.DevelopersWebhooksApi();
const opts = {
  'status': new CoboWaas2.WebhookEndpointStatus(),
  'event_type': new CoboWaas2.WebhookEventType(),
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listWebhookEndpoints(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **status** | [**WebhookEndpointStatus**](.md)|  | [optional] 
 **event_type** | [**WebhookEventType**](.md)|  | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListWebhookEndpoints200Response**](ListWebhookEndpoints200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listWebhookEventDefinitions

> [ListWebhookEventDefinitions200ResponseInner] listWebhookEventDefinitions()

Get webhook event types

This operation retrieves all supported webhook event types.

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
const apiInstance = new CoboWaas2.DevelopersWebhooksApi();
apiInstance.listWebhookEventDefinitions().then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

This endpoint does not need any parameter.

### Return type

[**[ListWebhookEventDefinitions200ResponseInner]**](ListWebhookEventDefinitions200ResponseInner.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listWebhookEventLogs

> ListWebhookEventLogs200Response listWebhookEventLogs(event_id, endpoint_id, opts)

List webhook event logs

This operation retrieves a list of webhook event logs by event ID. Each retry will generate a separate event log. 

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
const apiInstance = new CoboWaas2.DevelopersWebhooksApi();
const event_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const endpoint_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listWebhookEventLogs(event_id, endpoint_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **event_id** | **String**| The event ID. You can obtain a list of event IDs by calling [List all events](https://www.cobo.com/developers/v2/api-references/developers--webhooks/list-all-events). | 
 **endpoint_id** | **String**| The webhook endpoint ID. You can retrieve a list of webhook endpoint IDs by calling [List webhook endpoints](https://www.cobo.com/developers/v2/api-references/developers--webhooks/list-webhook-endpoints). | 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListWebhookEventLogs200Response**](ListWebhookEventLogs200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listWebhookEvents

> ListWebhookEvents200Response listWebhookEvents(endpoint_id, opts)

List all webhook events

This operation retrieves a list of webhook events that have occurred within the last 30 days.  &lt;Note&gt;The request will only return webhook events that have occurred to the wallets associated with your current API key. For example, if the current API key is only associated with Custodial Wallets, any webhook events that have occurred to an MPC Wallet will not be retrieved with the current API key.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.DevelopersWebhooksApi();
const endpoint_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'status': new CoboWaas2.WebhookEventStatus(),
  'type': new CoboWaas2.WebhookEventType(),
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listWebhookEvents(endpoint_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **endpoint_id** | **String**| The webhook endpoint ID. You can retrieve a list of webhook endpoint IDs by calling [List webhook endpoints](https://www.cobo.com/developers/v2/api-references/developers--webhooks/list-webhook-endpoints). | 
 **status** | [**WebhookEventStatus**](.md)|  | [optional] 
 **type** | [**WebhookEventType**](.md)|  | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListWebhookEvents200Response**](ListWebhookEvents200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## retryWebhookEventById

> RetryWebhookEventById201Response retryWebhookEventById(event_id, endpoint_id)

Retry event

This operation retries delivering a webhook event with the specified event ID. You can only retry delivering a webhook event in the &#x60;Retrying&#x60; or &#x60;Failed&#x60; status. 

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
const apiInstance = new CoboWaas2.DevelopersWebhooksApi();
const event_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const endpoint_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.retryWebhookEventById(event_id, endpoint_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **event_id** | **String**| The event ID. You can obtain a list of event IDs by calling [List all events](https://www.cobo.com/developers/v2/api-references/developers--webhooks/list-all-events). | 
 **endpoint_id** | **String**| The webhook endpoint ID. You can retrieve a list of webhook endpoint IDs by calling [List webhook endpoints](https://www.cobo.com/developers/v2/api-references/developers--webhooks/list-webhook-endpoints). | 

### Return type

[**RetryWebhookEventById201Response**](RetryWebhookEventById201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## triggerTestWebhookEvent

> TriggerTestWebhookEvent201Response triggerTestWebhookEvent(opts)

Trigger test event

This operation tests the functionality of your webhook endpoint by triggering a test webhook event. The test event will be sent to all the endpoints you have registered on Cobo Portal.  You only need to provide the event type. By default, the payload contains dummy data with no impact on your real business transactions or activities. You can optionally provide the &#x60;override_data&#x60; property to customize the payload.  &lt;Note&gt;Currently, you can only trigger test webhook events with the event data types [&#x60;Transaction&#x60;](https://www.cobo.com/developers/v2/guides/webhooks-callbacks/webhook-event-type#transaction-events-deposits%2Fwithdrawals%2Fcontract-calls%2Fmessage-signing) and [&#x60;TSSRequest&#x60;](https://www.cobo.com/developers/v2/guides/webhooks-callbacks/webhook-event-type#mpc-tss-request-events).&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.DevelopersWebhooksApi();
const opts = {
  'TriggerTestWebhookEventRequest': new CoboWaas2.TriggerTestWebhookEventRequest()
};
apiInstance.triggerTestWebhookEvent(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **TriggerTestWebhookEventRequest** | [**TriggerTestWebhookEventRequest**](TriggerTestWebhookEventRequest.md)| The request body used to trigger a test webhook event.  | [optional] 

### Return type

[**TriggerTestWebhookEvent201Response**](TriggerTestWebhookEvent201Response.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## updateWebhookEndpointById

> WebhookEndpoint updateWebhookEndpointById(endpoint_id, opts)

Update webhook endpoint

This operation updates the information of a specified webhook endpoint.

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
const apiInstance = new CoboWaas2.DevelopersWebhooksApi();
const endpoint_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const opts = {
  'UpdateWebhookEndpointByIdRequest': new CoboWaas2.UpdateWebhookEndpointByIdRequest()
};
apiInstance.updateWebhookEndpointById(endpoint_id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **endpoint_id** | **String**| The webhook endpoint ID. You can retrieve a list of webhook endpoint IDs by calling [List webhook endpoints](https://www.cobo.com/developers/v2/api-references/developers--webhooks/list-webhook-endpoints). | 
 **UpdateWebhookEndpointByIdRequest** | [**UpdateWebhookEndpointByIdRequest**](UpdateWebhookEndpointByIdRequest.md)| The request body to update a webhook endpoint. | [optional] 

### Return type

[**WebhookEndpoint**](WebhookEndpoint.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

