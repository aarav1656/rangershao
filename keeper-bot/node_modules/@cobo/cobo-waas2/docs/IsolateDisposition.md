# CoboWaas2.IsolateDisposition

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**transaction_id** | **String** | The UUID of the transaction whose funds are to be isolated. This identifies the original transaction that requires fund isolation. | 
**destination_address** | **String** | The blockchain address to receive the isolated funds. | 
**disposition_amount** | **String** | The amount to be isolated from the original transaction, specified as a numeric string. This value cannot exceed the total amount of the original transaction.  | 
**category_names** | **[String]** | Custom categories to identify and track this isolation transaction. Used for transaction classification and reporting. | [optional] 
**description** | **String** | Additional notes or description for the isolation. | [optional] 


