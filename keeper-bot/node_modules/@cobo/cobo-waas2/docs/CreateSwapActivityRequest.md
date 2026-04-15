# CoboWaas2.CreateSwapActivityRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**wallet_id** | **String** | The ID of the wallet used to pay. | 
**address** | **String** | The address of the wallet used to pay. | [optional] 
**quote_id** | **String** | The unique identifier of the swap quote. | 
**app_initiator** | **String** | The initiator of the swap activity. It is optional and defaults to your API key if not specified. | [optional] 
**request_id** | **String** | The request ID of the swap activity. | [optional] 
**receiver_address** | **String** | The destination address of the swap activity. This property is required only when the swap type is &#x60;Bridge&#x60; and the wallet is not a Custodial Wallet (Asset Wallet). | [optional] 
**fee** | [**TransactionRequestFee**](TransactionRequestFee.md) |  | [optional] 


