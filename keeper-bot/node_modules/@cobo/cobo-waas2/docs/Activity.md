# CoboWaas2.Activity

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** | The activity ID. | [optional] 
**initiator** | **String** | The initiator of the activity. | [optional] 
**initiator_type** | [**TransactionInitiatorType**](TransactionInitiatorType.md) |  | [optional] 
**type** | [**ActivityType**](ActivityType.md) |  | [optional] 
**wallet_id** | **String** | The staker&#39;s wallet ID. | [optional] 
**address** | **String** | The staker&#39;s wallet address. | [optional] 
**pool_id** | [**StakingPoolId**](StakingPoolId.md) |  | 
**token_id** | **String** | The token ID. | 
**staking_id** | **String** | The ID of the corresponding staking position. | [optional] 
**request_ids** | **[String]** | The request IDs of the corresponding transactions of the activity. | [optional] 
**amount** | **String** | The staking amount. | 
**transaction_ids** | **[String]** | The IDs of the corresponding transactions of the activity. | [optional] 
**timeline** | [**[ActivityTimeline]**](ActivityTimeline.md) | The timeline of the activity. | [optional] 
**fee** | [**TransactionRequestFee**](TransactionRequestFee.md) |  | [optional] 
**status** | [**ActivityStatus**](ActivityStatus.md) |  | 
**extra** | [**ActivityExtra**](ActivityExtra.md) |  | [optional] 
**created_timestamp** | **Number** | The time when the activity was created. | [optional] 
**updated_timestamp** | **Number** | The time when the activity was last updated. | [optional] 


