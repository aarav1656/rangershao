# CoboWaas2.Stakings

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** | The ID of the staking position. | 
**wallet_id** | **String** | The staker&#39;s wallet ID. | 
**address** | **String** | The staker&#39;s wallet address. | 
**amounts** | [**[AmountDetailsInner]**](AmountDetailsInner.md) | The details about the staking amount. | 
**pool_id** | [**StakingPoolId**](StakingPoolId.md) |  | 
**token_id** | **String** | The token ID. | 
**rewards_info** | **Object** | The information about the staking rewards. | [optional] 
**created_timestamp** | **Number** | The time when the staking position was created. | 
**updated_timestamp** | **Number** | The time when the staking position was last updated. | 
**validator_info** | [**BabylonValidator**](BabylonValidator.md) |  | [optional] 
**validators** | [**[BabylonValidator]**](BabylonValidator.md) |  | [optional] 
**extra** | [**StakingsExtra**](StakingsExtra.md) |  | [optional] 


