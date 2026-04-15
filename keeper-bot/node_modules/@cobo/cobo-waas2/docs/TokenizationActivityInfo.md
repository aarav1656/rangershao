# CoboWaas2.TokenizationActivityInfo

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**activity_id** | **String** | The ID of the activity. | 
**token_id** | **String** | The token ID. | 
**type** | [**TokenizationOperationType**](TokenizationOperationType.md) |  | 
**status** | [**TokenizationActivityStatus**](TokenizationActivityStatus.md) |  | 
**source** | [**TokenizationTokenOperationSource**](TokenizationTokenOperationSource.md) |  | 
**initiator** | **String** | The initiator of the activity. | 
**initiator_type** | [**TransactionInitiatorType**](TransactionInitiatorType.md) |  | 
**transaction_ids** | **[String]** | The IDs of the corresponding transactions of the activity. | 
**created_timestamp** | **Number** | The creation timestamp of the activity in milliseconds since the Unix epoch. | 
**updated_timestamp** | **Number** | The last update timestamp of the activity in milliseconds since the Unix epoch. | 


