# CoboWaas2.KyaScreeningsEventData

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**screening_id** | **String** | The unique system-generated identifier for this screening request (UUID format, fixed 36 characters). | 
**address** | **String** | The screened blockchain address. | 
**chain_id** | **String** | The chain identifier. | 
**status** | [**KyaScreeningStatus**](KyaScreeningStatus.md) |  | 
**created_timestamp** | **Number** | The time when the screening request was created, in Unix timestamp format, measured in milliseconds. | 
**updated_timestamp** | **Number** | The time when the screening status was updated, in Unix timestamp format, measured in milliseconds. | 


