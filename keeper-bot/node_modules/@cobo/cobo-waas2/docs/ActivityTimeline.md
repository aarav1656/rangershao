# CoboWaas2.ActivityTimeline

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**action** | [**ActivityAction**](ActivityAction.md) |  | 
**status** | **String** | The status of the action. Possible values include:   - &#x60;Success&#x60;: The action is successfully completed.   - &#x60;Processing&#x60;: The action is being processed.   - &#x60;Failed&#x60;: The action has failed.  | [optional] 
**timestamp** | **Number** | The time when the action took place, in Unix timestamp format, measured in milliseconds.  - For the &#x60;Submitted&#x60; action, &#x60;timestamp&#x60; represents the time the staking, unstaking, or withdrawal request was created.  - For the &#x60;BTCConfirmation&#x60; action, &#x60;timestamp&#x60; represents the time when the request was confirmed on the Bitcoin chain, or when the confirmation failed. - For the &#x60;BabylonConfirmation&#x60; action, &#x60;timestamp&#x60; represents the time when the request was confirmed by the Babylon protocol, or when the confirmation failed.  | [optional] 
**transaction_id** | **String** | The ID of the corresponding transaction. | [optional] 


