# CoboWaas2.TSSGroup

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** | The TSS key share group ID. | [optional] 
**canonical_group_id** | **String** | The canonical group ID. | [optional] 
**protocol_group_id** | **String** | The protocol group ID. | [optional] 
**protocol_type** | **String** | The protocol type. | [optional] 
**created_timestamp** | **Number** | The group creation timestamp, in Unix timestamp format, measured in milliseconds. | [optional] 
**type** | [**TSSGroupType**](TSSGroupType.md) |  | [optional] 
**root_extended_public_key** | **String** | The root extended public key. | [optional] 
**chaincode** | **String** | The chaincode. | [optional] 
**curve** | [**TSSCurveType**](TSSCurveType.md) |  | [optional] 
**threshold** | **Number** | The threshold. | [optional] 
**participants** | [**[TSSParticipant]**](TSSParticipant.md) |  | [optional] 


