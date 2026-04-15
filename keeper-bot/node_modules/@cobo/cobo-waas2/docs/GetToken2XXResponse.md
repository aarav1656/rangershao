# CoboWaas2.GetToken2XXResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**access_token** | **String** | The Org Access Token. | [optional] 
**token_type** | **String** | The type of the tokens, which is Bearer. | [optional] 
**scope** | **String** | The scope of the Org Access Token to limit the app&#39;s access to the organization&#39;s resources.  **Note**: Currently this property value is empty. The scope of the Org Access Token is based on the permissions granted when the app user installs the app.  | [optional] 
**expires_in** | **Number** | The time in seconds in which the Org Access Token expires. | [optional] 
**refresh_token** | **String** | The Refresh Token, used to obtain a new Org Access Token when the current Org Access Token expires. The expiration time for Refresh Tokens is currently set to 30 days and is subject to change. | [optional] 


