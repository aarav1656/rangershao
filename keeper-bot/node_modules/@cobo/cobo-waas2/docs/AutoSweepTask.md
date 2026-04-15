# CoboWaas2.AutoSweepTask

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**task_id** | **String** | Auto-sweep task ID. | 
**wallet_id** | **String** | Wallet ID. | 
**token_id** | **String** | Token ID of the swept token. You can retrieve the IDs of all the tokens you can use by calling [List enabled tokens](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-tokens). | 
**status** | [**AutoSweepTaskStatus**](AutoSweepTaskStatus.md) |  | 
**transaction_ids** | **[String]** | IDs of the transactions triggered by the task. | [optional] 
**failed_reasons** | **[String]** | Reasons why the task creation failed. | [optional] 
**created_timestamp** | **Number** | The time when the task was created, in Unix timestamp format, measured in milliseconds. | 
**updated_timestamp** | **Number** | The time when the task was updated, in Unix timestamp format, measured in milliseconds. | [optional] 


