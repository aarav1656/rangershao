# CoboWaas2.CoreStakingActivityDetailExtra

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**pool_type** | [**StakingPoolType**](StakingPoolType.md) |  | 
**timelock** | **Number** | The Unix timestamp (in seconds) when the staking position will be unlocked and available for withdrawal. | [optional] 
**change_address** | **String** | The change address on the Bitcoin chain. If not provided, the source wallet&#39;s address will be used as the change address. | [optional] 
**validator_address** | **String** | The validator&#39;s EVM address. | [optional] 
**reward_address** | **String** | The EVM address to receive staking rewards. | [optional] 


