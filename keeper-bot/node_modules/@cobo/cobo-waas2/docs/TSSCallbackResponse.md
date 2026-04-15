# CoboWaas2.TSSCallbackResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**request_id** | **String** | The unique ID of the callback request. | [optional] 
**status** | **Number** | The response status code. 0 indicates success.  Any other value indicates that an error occurred while processing the request in the callback server. | [optional] 
**action** | [**TSSCallbackActionType**](TSSCallbackActionType.md) |  | [optional] 
**error** | **String** | The error message. - When status is not 0, Contains internal error messages from the callback server. - When status is 0 and action is REJECT, Contains the specific reason for the rejection. | [optional] 


