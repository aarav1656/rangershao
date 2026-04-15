# CoboWaas2.WebhookEvent

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**event_id** | **String** | The event ID. | [optional] 
**url** | **String** | The webhook endpoint URL. | 
**created_timestamp** | **Number** | The time when the event was triggered, in Unix timestamp format (milliseconds). - The value remains unchanged across retries. - The default webhook timeout is 2 seconds.  | 
**type** | [**WebhookEventType**](WebhookEventType.md) |  | 
**data** | [**WebhookEventData**](WebhookEventData.md) |  | 
**status** | [**WebhookEventStatus**](WebhookEventStatus.md) |  | [optional] 
**next_retry_timestamp** | **Number** | The timestamp indicating the next scheduled retry to deliver this event, in Unix timestamp format, measured in milliseconds. This field is only present if the event status is &#x60;Retrying&#x60;.  | [optional] 
**retries_left** | **Number** | The number of retries left. This field is only present if the event status is &#x60;Retrying&#x60;. | [optional] 


