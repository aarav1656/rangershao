# CoboWaas2.FeeStationFiatTransaction

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**transaction_id** | **String** | The transaction ID. | 
**main_transaction_id** | **String** | The UUID of the parent (main) transaction that this record is associated with. Set only when the current record is a gas/fee transaction initiated by FeeStation; omit for main transactions. | [optional] 
**transaction_type** | [**FeeStationFiatTransactionType**](FeeStationFiatTransactionType.md) |  | 
**amount** | **String** | The transaction amount. | 
**fiat_currency** | **String** | The fiat currency of the transaction. Possible values include:   - &#x60;USD&#x60;: US Dollar.  | 
**status** | **String** | The status of the fiat transaction. Possible values include:   - &#x60;Created&#x60;: The transaction has been created.   - &#x60;Succeeded&#x60;: The transaction has been completed successfully.  | 
**cobo_category** | **[String]** | The Cobo category of the transaction. | [optional] 
**created_timestamp** | **Number** | The time when the transaction was created, in Unix timestamp format, measured in milliseconds. | [optional] 
**modified_timestamp** | **Number** | The time when the transaction was last modified, in Unix timestamp format, measured in milliseconds. | [optional] 



## Enum: StatusEnum


* `Created` (value: `"Created"`)

* `Succeeded` (value: `"Succeeded"`)

* `unknown_default_open_api` (value: `"unknown_default_open_api"`)




