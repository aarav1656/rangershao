# CoboWaas2.GetApiKeyInfo200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **String** | The API key name. | 
**curve_type** | **String** | The curve type used for the API key, which determines the cryptographic algorithm for key generation and signing. Possible values include: - &#x60;ED25519&#x60;: Ed25519 - &#x60;SECP256K1&#x60;: Secp256k1  | 
**key** | **String** | The API key value. | 
**callback_url** | **String** | The URL of the callback endpoint that receives callback messages triggered by this API key. | [optional] 
**valid_ips** | **[String]** | (Applicable to permanent API keys only) The list of IP addresses that are allowed to use this API key. | [optional] 
**created_timestamp** | **Number** | The time when the API key was registered, in Unix timestamp format, measured in milliseconds. | 
**updated_timestamp** | **Number** | The time when the API key information was last updated, in Unix timestamp format, measured in milliseconds. | 
**expired_timestamp** | **Number** | The time when the API key expires, in Unix timestamp format, measured in milliseconds. For permanent API keys, this property value is &#x60;null&#x60;. | [optional] 
**role_scopes** | [**[RoleScopes]**](RoleScopes.md) | The list of user roles and wallet scopes associated with the API key. | [optional] 



## Enum: CurveTypeEnum


* `ED25519` (value: `"ED25519"`)

* `SECP256K1` (value: `"SECP256K1"`)

* `unknown_default_open_api` (value: `"unknown_default_open_api"`)




