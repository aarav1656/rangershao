# CoboWaas2.PaymentTransaction

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**tx_id** | **String** | The transaction ID. | 
**tx_hash** | **String** | The transaction hash. | [optional] 
**token_id** | **String** | The ID of the cryptocurrency. | [optional] 
**from_address** | **String** | The source address of the transaction. | 
**to_address** | **String** | The destination address of the transaction. | 
**amount** | **String** | The amount of cryptocurrency transferred, as a decimal string. | 
**status** | [**TransactionStatus**](TransactionStatus.md) |  | 
**counterparty** | [**Counterparty**](Counterparty.md) |  | [optional] 
**destination** | [**Destination**](Destination.md) |  | [optional] 
**created_timestamp** | **Number** | The time when the transaction was created, in Unix timestamp format, measured in milliseconds. | 
**updated_timestamp** | **Number** | The time when the transaction was updated, in Unix timestamp format, measured in milliseconds. | 


