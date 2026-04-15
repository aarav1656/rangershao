# CoboWaas2.WebhookEventLog

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** | The event log ID. | 
**created_timestamp** | **Number** | The time when the event was triggered, in Unix timestamp format (milliseconds). - The value remains unchanged across retries. - The default webhook timeout is 2 seconds.  | 
**request_headers** | **Object** | The request headers of the webhook event. | 
**request_body** | [**WebhookEvent**](WebhookEvent.md) |  | 
**response_body** | **String** | The response body of the webhook event. | [optional] 
**response_status_code** | **Number** | The response status code of the webhook event. | [optional] 
**response_time** | **Number** | The response time of the webhook event, in milliseconds. | [optional] 
**success** | **Boolean** | Whether the webhook event has been successfully delivered. | 
**failure_reason** | **String** | The reason why the webhook event fails to be delivered. | [optional] 


