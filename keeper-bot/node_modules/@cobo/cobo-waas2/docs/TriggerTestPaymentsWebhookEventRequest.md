# CoboWaas2.TriggerTestPaymentsWebhookEventRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**event_type** | [**WebhookEventType**](WebhookEventType.md) |  | 
**override_data** | **Object** | An optional object to customize the webhook event payload. Include only the fields you want to override.  The provided fields must match the webhook event data structure for the specified event type. For the full event data structure, refer to the &#x60;data.data&#x60; property in the response of [List all webhook events](https://www.cobo.com/developers/v2/api-references/developers--webhooks/list-all-webhook-events).  If this property is omitted, a default payload is returned.  | [optional] 


