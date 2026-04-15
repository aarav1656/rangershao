# CoboWaas2.TransferParams

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**request_id** | **String** | A client-defined unique request identifier (idempotency key) used to prevent duplicate transfer requests. It must be unique within the same organization. Requests with the same request ID will be rejected with an error.  | 
**source** | [**TransferSource**](TransferSource.md) |  | 
**token_id** | **String** | The token ID of the transferred token. You can retrieve the IDs of all the tokens you can use by calling [List enabled tokens](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-tokens). For transfers from Exchange Wallets, this property value represents the asset ID. | 
**destination** | [**TransferDestination**](TransferDestination.md) |  | 
**category_names** | **[String]** | The custom category for you to identify your transactions. | [optional] 
**description** | **String** | The description of the transfer. | [optional] 
**fee** | [**TransactionRequestFee**](TransactionRequestFee.md) |  | [optional] 
**transaction_process_type** | [**TransactionProcessType**](TransactionProcessType.md) |  | [optional] 
**auto_fuel** | [**AutoFuelType**](AutoFuelType.md) |  | [optional] 
**pre_check** | [**PreCheck**](PreCheck.md) |  | [optional] 


