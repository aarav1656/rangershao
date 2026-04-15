# CoboWaas2.KyaScreeningResult

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**request_id** | **String** | The idempotency identifier from the request, unique within your organization, used for tracking and troubleshooting. Only present in create response. | 
**screening_id** | **String** | The unique system-generated identifier for this screening request (UUID format, fixed 36 characters). | 
**address** | **String** | The screened blockchain address. | 
**chain_id** | **String** | The chain identifier. | 
**note** | **String** | Optional note for this address screening. | [optional] 
**created_timestamp** | **Number** | The time when the screening request was created, in Unix timestamp format, measured in milliseconds. | 
**requested_by** | **String** | The identifier of the user or application that created this screening request. | 
**status** | [**KyaScreeningStatus**](KyaScreeningStatus.md) |  | 
**risk_assessment** | [**KyaScreeningResultRiskAssessment**](KyaScreeningResultRiskAssessment.md) |  | [optional] 


