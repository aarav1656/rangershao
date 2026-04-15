# CoboWaas2.MessageSignParams

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**request_id** | **String** | The request ID that is used to track a transaction request. The request ID is provided by you and must be unique within your organization. | 
**chain_id** | **String** | The chain ID, which is the unique identifier of a blockchain. You can retrieve the IDs of all the chains you can use by calling [List enabled chains](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-chains). | 
**source** | [**MessageSignSource**](MessageSignSource.md) |  | 
**destination** | [**MessageSignDestination**](MessageSignDestination.md) |  | 
**description** | **String** | The description of the message signing transaction. | [optional] 
**category_names** | **[String]** | The custom category for you to identify your transactions. | [optional] 


