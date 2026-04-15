# CoboWaas2.TransactionFILFee

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**gas_base** | **String** | The minimum fee required for a transaction to be included in a block. The base fee is dynamically adjusted based on network congestion to maintain target block utilization. It is burned rather than paid to miners, reducing the total Filecoin supply over time. | [optional] 
**gas_premium** | **String** | An optional tip you can include to prioritize your transaction. The gas premium incentivizes miners to include your transaction sooner than those offering only the base fee. | [optional] 
**gas_fee_cap** | **String** | The maximum gas price you are willing to pay per unit of gas. | [optional] 
**gas_limit** | **String** | The maximum amount of gas your transaction is allowed to consume. | [optional] 
**fee_type** | [**FeeType**](FeeType.md) |  | 
**token_id** | **String** | The token used to pay the transaction fee. | [optional] 
**fee_used** | **String** | The actually charged transaction fee. | [optional] 
**estimated_fee_used** | **String** | The estimated transaction fee. | [optional] 


