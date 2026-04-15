# CoboWaas2.DispositionEventData

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**transaction_id** | **String** | The transaction ID. | 
**disposition_type** | [**DispositionType**](DispositionType.md) |  | 
**disposition_status** | [**DispositionStatus**](DispositionStatus.md) |  | 
**destination_address** | **String** | The blockchain address to receive the refunded/isolated funds. | [optional] 
**disposition_amount** | **String** | The amount to be refunded/isolated from the original transaction, specified as a numeric string. This value cannot exceed the total amount of the original transaction.  | [optional] 
**updated_timestamp** | **Number** | The time when the disposition was updated, in Unix timestamp format, measured in milliseconds. | 


