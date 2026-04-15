# CoboWaas2.ApiLogDetails

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**log_id** | **String** | A unique identifier for the API log, used for tracking. | 
**api_method** | **String** | The HTTP method used for the API request. | 
**api_endpoint** | **String** | The endpoint of the API request. | 
**status_code** | **Number** | The HTTP status code returned by the API request. | 
**ip_address** | **String** | The client&#39;s IP address that made the API request. | 
**request_timestamp** | **Number** | The time when the API request was created, in Unix timestamp format, measured in milliseconds. | 
**api_key** | **String** | The API key used to call the API. For more details, refer to [API key](https://www.cobo.com/developers/v2/guides/overview/cobo-auth#api-key). | 
**response_body** | **String** | The response body of the API request. | 
**query_params** | **String** | The query parameters of the API request. | 
**request_body** | **String** | The request body of the API request. | 


