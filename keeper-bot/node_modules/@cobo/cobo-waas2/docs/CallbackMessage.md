# CoboWaas2.CallbackMessage

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** | The callback message ID. | 
**created_timestamp** | **Number** | The time when the callback message was created, in Unix timestamp format, measured in milliseconds. | 
**updated_timestamp** | **Number** | The time when the callback message was updated, in Unix timestamp format, measured in milliseconds. | 
**request_id** | **String** | The request ID of the transaction. | 
**transaction_id** | **String** | The transaction ID. | 
**wallet_id** | **String** | The wallet ID. | [optional] 
**url** | **String** | The callback endpoint URL. | 
**data** | [**Transaction**](Transaction.md) |  | 
**status** | **String** | The callback message status. Possible values include &#x60;Denied&#x60;, &#x60;Approved&#x60;, and &#x60;Failed&#x60;.  | 
**result** | **String** | The callback message result. Possible values include &#x60;ok&#x60; and &#x60;deny&#x60;.  | [optional] 



## Enum: StatusEnum


* `Denied` (value: `"Denied"`)

* `Approved` (value: `"Approved"`)

* `Failed` (value: `"Failed"`)

* `unknown_default_open_api` (value: `"unknown_default_open_api"`)





## Enum: ResultEnum


* `ok` (value: `"ok"`)

* `deny` (value: `"deny"`)

* `unknown_default_open_api` (value: `"unknown_default_open_api"`)




