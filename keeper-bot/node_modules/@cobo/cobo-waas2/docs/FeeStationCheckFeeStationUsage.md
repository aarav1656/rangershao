# CoboWaas2.FeeStationCheckFeeStationUsage

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**request_id** | **String** | The request ID that is used to track a transaction request. The request ID is provided by you and must be unique within your organization. | 
**amount** | **String** | Applicable to transfer requests only. The amount of tokens to be transferred in this request. | [optional] 
**token_id** | **String** | Applicable to transfer requests only. The token ID of the asset to be transferred.   You can retrieve available token IDs by calling   [List enabled tokens](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-tokens).  | [optional] 
**fee_token_id** | **String** | The token ID used to pay the gas fee for the main transaction. You can retrieve available token IDs by calling [List enabled tokens](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-tokens). | [optional] 
**estimated_fee_amount** | **String** | The estimated transaction fee required for this transfer, before applying any Fee Station rules. | 
**from_address** | **String** | The blockchain address that initiates the transfer. | 
**from_wallet_id** | **String** | The wallet ID. | 
**auto_fuel** | [**AutoFuelType**](AutoFuelType.md) |  | [optional] 


