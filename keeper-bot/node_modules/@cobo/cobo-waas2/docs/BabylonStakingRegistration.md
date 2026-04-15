# CoboWaas2.BabylonStakingRegistration

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** | The registration ID, a unique identifier for tracking the staking registration. | [optional] 
**staking_id** | **String** | The ID of the Phase-1 BTC staking position. | [optional] 
**babylon_address** | [**StakingSource**](StakingSource.md) |  | [optional] 
**btc_address** | [**StakingSource**](StakingSource.md) |  | [optional] 
**status** | [**BabylonRegistrationRequestStatus**](BabylonRegistrationRequestStatus.md) |  | [optional] 
**staked_amount** | **String** | The amount of BTC that is staked. | [optional] 
**error_message** | **String** | The error message if the Babylon Phase-2 registration request failed. | [optional] 
**created_timestamp** | **Number** | The time when the registration was created, in Unix timestamp format, measured in milliseconds. | [optional] 
**updated_timestamp** | **Number** | The time when the registration was updated, in Unix timestamp format, measured in milliseconds. | [optional] 


