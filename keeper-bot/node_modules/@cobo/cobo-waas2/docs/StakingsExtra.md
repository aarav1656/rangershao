# CoboWaas2.StakingsExtra

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**pool_type** | [**StakingPoolType**](StakingPoolType.md) |  | 
**pos_chain** | **String** | The Proof-of-Stake (PoS) chain. | 
**unlock_timestamp** | **Number** | The estimated time when the bitcoins will be unlocked, in Unix timestamp format, measured in milliseconds. | [optional] 
**unlock_block_height** | **Number** | The block height at which the bitcoins will be unlocked. | [optional] 
**stake_address** | **String** | The address receiving the staked bitcoins. | [optional] 
**unbond_address** | **String** | The address receiving the unlocked bitcoins. | [optional] 
**beacon_validators** | [**[EthStakingExtraAllOfBeaconValidators]**](EthStakingExtraAllOfBeaconValidators.md) | The list of validator information. | [optional] 
**staker_address** | **String** | The staker&#39;s Bitcoin address. | 
**validator_address** | **String** | The validator&#39;s EVM address. | 
**reward_address** | **String** | The EVM address to receive staking rewards. | 
**timelock** | **Number** | The Unix timestamp (in seconds) when the staking position will be unlocked and available for withdrawal. | 


