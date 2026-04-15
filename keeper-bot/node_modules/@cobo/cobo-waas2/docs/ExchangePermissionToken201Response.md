# CoboWaas2.ExchangePermissionToken201Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**access_token** | **String** | The Access Token. | [optional] 
**token_type** | **String** | The token type. This is always &#x60;Bearer&#x60;. | [optional] 
**expires_in** | **Number** | The time in seconds until the Access Token expires. This is always &#x60;3600&#x60;, indicating the token expires 1 hour after issuance. | [optional] 
**refresh_token** | **String** | The Refresh Token. Use it to obtain a new Access Token when the current one expires. The Refresh Token is valid for 7 days. | [optional] 


