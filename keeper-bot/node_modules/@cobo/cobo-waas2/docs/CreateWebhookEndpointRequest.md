# CoboWaas2.CreateWebhookEndpointRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**url** | **String** | The webhook endpoint URL. | 
**subscribed_events** | [**[WebhookEventType]**](WebhookEventType.md) | The event types you want to subscribe to for this webhook endpoint. You can call [Get webhook event types](https://www.cobo.com/developers/v2/api-references/developers--webhooks/get-webhook-event-types) to retrieve all available event types.  | 
**description** | **String** | The description of the webhook endpoint. | [optional] 


