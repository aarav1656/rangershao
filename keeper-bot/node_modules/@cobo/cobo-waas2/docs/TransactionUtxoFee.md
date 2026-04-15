# CoboWaas2.TransactionUtxoFee

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**fee_rate** | **String** | The fee rate in sat/vByte. The fee rate represents the satoshis you are willing to pay for each byte of data that your transaction will consume on the blockchain. | [optional] 
**fee_type** | [**FeeType**](FeeType.md) |  | 
**token_id** | **String** | The token used to pay the transaction fee. | [optional] 
**fee_used** | **String** | The actually charged transaction fee. | [optional] 
**estimated_fee_used** | **String** | The estimated transaction fee. | [optional] 
**max_fee_amount** | **String** | The maximum fee that you are willing to pay for the transaction. The transaction will fail if the transaction fee exceeds the maximum fee. | [optional] 


