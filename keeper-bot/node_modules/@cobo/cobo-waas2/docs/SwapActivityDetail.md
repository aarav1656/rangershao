# CoboWaas2.SwapActivityDetail

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**activity_id** | **String** | The unique identifier of the swap activity. | [optional] 
**swap_type** | [**SwapType**](SwapType.md) |  | [optional] 
**status** | [**SwapActivityStatus**](SwapActivityStatus.md) |  | [optional] 
**request_id** | **String** | The request ID of the swap transaction. | [optional] 
**wallet_id** | **String** | The ID of the wallet used to pay. | [optional] 
**pay_token_id** | **String** | The ID of the token to pay. | [optional] 
**receive_token_id** | **String** | The ID of the token to receive. | [optional] 
**pay_amount** | **String** | The amount of the token to pay. | [optional] 
**receive_amount** | **String** | The amount of the token to receive. | [optional] 
**fee_token_id** | **String** | The ID of the token used for paying the service fee. | [optional] 
**fee_amount** | **String** | The amount of the service fee. | [optional] 
**initiator** | **String** | The initiator of the swap activity. | [optional] 
**initiator_type** | [**TransactionInitiatorType**](TransactionInitiatorType.md) |  | [optional] 
**description** | **String** | The description of the swap activity. | [optional] 
**created_timestamp** | **Number** | The time when the swap activity was created, in Unix timestamp format, measured in milliseconds. | [optional] 
**updated_timestamp** | **Number** | The time when the swap activity was last updated, in Unix timestamp format, measured in milliseconds. | [optional] 
**network_fee** | [**TransactionRequestFee**](TransactionRequestFee.md) |  | [optional] 
**destination_address** | **String** | The address of an MPC Wallet or Custodial Wallet (Web3 Wallet) that receives the swapped or bridged assets. | [optional] 
**timeline** | [**[SwapActivityTimeline]**](SwapActivityTimeline.md) |  | [optional] 
**approvers** | [**[SwapActivityApprovers]**](SwapActivityApprovers.md) |  | [optional] 
**signers** | [**[SwapActivitySigners]**](SwapActivitySigners.md) |  | [optional] 
**receiving_transaction** | [**SwapReceivingTransaction**](SwapReceivingTransaction.md) |  | [optional] 


