# CoboWaas2.TokenizationERC20TokenParams

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**standard** | [**TokenizationTokenStandard**](TokenizationTokenStandard.md) |  | 
**name** | **String** | The name of the token. | 
**symbol** | **String** | The symbol of the token. | 
**decimals** | **Number** | The number of decimals for the token (0-18). | 
**token_access_activated** | **Boolean** | Whether the allowlist feature is activated for the token. When activated, only addresses in the allowlist can perform token operations. | [optional] [default to false]
**permissions** | [**TokenizationERC20TokenPermissionParams**](TokenizationERC20TokenPermissionParams.md) |  | [optional] 


