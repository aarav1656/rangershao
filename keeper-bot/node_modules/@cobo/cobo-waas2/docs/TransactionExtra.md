# CoboWaas2.TransactionExtra

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**extra_type** | [**TransactionExtraType**](TransactionExtraType.md) |  | 
**babylon_address_info** | [**AddressInfo**](AddressInfo.md) |  | [optional] 
**btc_address_info** | [**AddressInfo**](AddressInfo.md) |  | [optional] 
**stake_amount** | **String** | The original staking amount. | [optional] 
**finality_provider_public_key** | **String** | The public key of the finality provider. | [optional] 
**stake_block_time** | **Number** | The number of blocks that need to be processed before the locked tokens are unlocked and become accessible. | [optional] 
**param_version** | **Number** | The version of Babylon global parameters. | [optional] 
**withdraw_from_type** | [**ActivityType**](ActivityType.md) |  | [optional] 
**slash_from_type** | [**ActivityType**](ActivityType.md) |  | [optional] 
**timelock** | **Number** | The Unix timestamp (in seconds) when the staking position will be unlocked and available for withdrawal. | [optional] 
**change_address** | **String** | The change address on the Bitcoin chain. If not provided, the source wallet&#39;s address will be used as the change address. | [optional] 
**validator_address** | **String** | The validator&#39;s EVM address. | [optional] 
**reward_address** | **String** | The EVM address used to receive staking rewards. | [optional] 
**dapp_name** | **String** | The dapp name that initiated this transaction. | [optional] 
**dapp_domain** | **String** | The dapp domain that initiated this transaction | [optional] 
**session_id** | **String** | The session id that initiated this transaction | [optional] 


