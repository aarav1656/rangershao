# CoboWaas2.TokenListing

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**request_id** | **String** | The unique identifier of the token listing request. | 
**chain_id** | **String** | The ID of the blockchain where the token is deployed. | 
**contract_address** | **String** | The token&#39;s contract address on the specified blockchain. | 
**wallet_type** | [**WalletType**](WalletType.md) |  | 
**wallet_subtype** | [**WalletSubtype**](WalletSubtype.md) |  | 
**token** | [**TokenInfo**](TokenInfo.md) |  | [optional] 
**status** | [**TokenListingRequestStatus**](TokenListingRequestStatus.md) |  | 
**source** | [**TokenListingRequestSource**](TokenListingRequestSource.md) |  | [optional] 
**feedback** | **String** | The feedback provided by Cobo when a token listing request is rejected. | [optional] 
**created_timestamp** | **Number** | The time when the request was created in Unix timestamp format, measured in milliseconds. | [optional] 
**updated_timestamp** | **Number** | The time when the request was last updated in Unix timestamp format, measured in milliseconds. | [optional] 


