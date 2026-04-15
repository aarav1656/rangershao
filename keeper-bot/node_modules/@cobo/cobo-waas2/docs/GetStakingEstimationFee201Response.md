# CoboWaas2.GetStakingEstimationFee201Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**pool_type** | [**StakingPoolType**](StakingPoolType.md) |  | [optional] 
**fee** | [**EstimatedFee**](EstimatedFee.md) |  | [optional] 
**validator_pubkeys** | **[String]** | A list of public keys associated with the Ethereum validators for this staking operation. | [optional] 
**core_btc_staking_address** | **String** | The P2WSH address generated for this staking operation (only applicable if the estimated fee is for CORE staking). | [optional] 
**fee_type** | [**FeeType**](FeeType.md) |  | [optional] 
**fee_amount** | **String** | The amount of the estimated fee. | [optional] 
**token_id** | **String** | The token ID of the staking fee. | [optional] 


