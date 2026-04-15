# CoboWaas2.TokenizationEstimateFeeRequestOperationParams

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**chain_id** | **String** | The chain ID where the token will be issued. | 
**source** | [**TokenizationTokenOperationSource**](TokenizationTokenOperationSource.md) |  | 
**token_params** | [**TokenizationIssueTokenParamsTokenParams**](TokenizationIssueTokenParamsTokenParams.md) |  | 
**operation_type** | [**TokenizationOperationType**](TokenizationOperationType.md) |  | 
**request_id** | **String** | The request ID that is used to track a transaction request. The request ID is provided by you and must be unique within your organization. | [optional] 
**mints** | [**[TokenizationMintTokenParamsMintsInner]**](TokenizationMintTokenParamsMintsInner.md) | Details for each token mint, including amount and address to mint to. | 
**token_id** | **String** | The ID of the token. | 
**burns** | [**[TokenizationBurnTokenParamsBurnsInner]**](TokenizationBurnTokenParamsBurnsInner.md) | Details for each token burn, including amount and address to burn from. | 
**action** | [**TokenizationUpdateAddressAction**](TokenizationUpdateAddressAction.md) |  | 
**addresses** | [**[TokenizationUpdateAddressPermissions]**](TokenizationUpdateAddressPermissions.md) |  | 
**activation** | **Boolean** | Whether to activate the allowlist feature for the token. | 
**data** | [**TokenizationContractCallParamsData**](TokenizationContractCallParamsData.md) |  | [optional] 


