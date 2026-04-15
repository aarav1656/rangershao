# CoboWaas2.TransactionEvmLegacyFee

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**gas_price** | **String** | The gas price, in wei. The gas price represents the amount of ETH that must be paid to validators for processing transactions per gas unit used. | [optional] 
**gas_limit** | **String** | The gas limit. It represents the maximum number of gas units that you are willing to pay for the execution of a transaction or Ethereum Virtual Machine (EVM) operation. The gas unit cost of each operation varies. | [optional] 
**fee_type** | [**FeeType**](FeeType.md) |  | 
**token_id** | **String** | The token used to pay the transaction fee. | [optional] 
**fee_used** | **String** | The actually charged transaction fee. | [optional] 
**estimated_fee_used** | **String** | The estimated transaction fee. | [optional] 
**gas_used** | **String** | The gas units used in the transaction. | [optional] 


