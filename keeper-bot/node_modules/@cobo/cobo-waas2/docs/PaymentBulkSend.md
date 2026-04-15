# CoboWaas2.PaymentBulkSend

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**bulk_send_id** | **String** | The bulk send ID. | 
**source_account** | **String** | The source account from which the bulk send will be made. - If the source account is a merchant account, provide the merchant&#39;s ID (e.g., \&quot;M1001\&quot;). - If the source account is the developer account, use the string &#x60;\&quot;developer\&quot;&#x60;.  | 
**description** | **String** | The description for the entire bulk send batch. | [optional] 
**execution_mode** | [**PaymentBulkSendExecutionMode**](PaymentBulkSendExecutionMode.md) |  | 
**status** | [**PaymentBulkSendStatus**](PaymentBulkSendStatus.md) |  | 
**created_timestamp** | **Number** | The created time of the bulk send, represented as a UNIX timestamp in seconds. | 
**updated_timestamp** | **Number** | The updated time of the bulk send, represented as a UNIX timestamp in seconds. | 


