# CoboWaas2.TriggerTestWebhookEventRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**event_type** | [**WebhookEventType**](WebhookEventType.md) |  | 
**override_data** | **Object** | An object for customization of the webhook event payload. You only need to include the fields you want to customize.   The provided fields must match the webhook event data structure, depending on the specified event type. For a complete introduction of the webhook event data structure, refer to the &#x60;data.data&#x60; property in the response of [List all webhook events](https://www.cobo.com/developers/v2/api-references/developers--webhooks/list-all-webhook-events).  If this property is not provided, a default payload will be returned.  | [optional] 


