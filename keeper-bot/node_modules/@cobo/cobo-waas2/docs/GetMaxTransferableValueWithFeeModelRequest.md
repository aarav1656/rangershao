# CoboWaas2.GetMaxTransferableValueWithFeeModelRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**token_id** | **String** | The token ID of the transferred token. You can retrieve the IDs of all the tokens you can use by calling [List enabled tokens](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-tokens). For transfers from Exchange Wallets, this property value represents the asset ID. | 
**fee** | [**TransactionRequestFee**](TransactionRequestFee.md) |  | 
**to_address** | **String** | The recipient&#39;s address. | 
**from_address** | **String** | The sender&#39;s address. This property is required when using an EVM address in an MPC Wallet. | [optional] 


