# CoboWaas2.TokenizationERC20WrappedTokenParams

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**standard** | [**TokenizationTokenStandard**](TokenizationTokenStandard.md) |  | 
**name** | **String** | The name of the token. | 
**symbol** | **String** | The symbol of the token. | 
**permissions** | [**TokenizationERC20WrappedTokenPermissionParams**](TokenizationERC20WrappedTokenPermissionParams.md) |  | [optional] 
**token_access_activated** | **Boolean** | Whether the allowlist feature is activated for the token. When activated, only addresses in the allowlist can perform token operations. | [optional] [default to false]
**underlying_token** | **String** | The address of the underlying token that this tokenized asset represents. | 


