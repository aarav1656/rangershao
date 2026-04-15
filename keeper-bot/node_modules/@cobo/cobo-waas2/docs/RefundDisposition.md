# CoboWaas2.RefundDisposition

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**transaction_id** | **String** | The UUID of the transaction whose funds are to be refunded. This identifies the original transaction that requires refund processing. | 
**destination_address** | **String** | The blockchain address to receive the refunded funds. | 
**disposition_amount** | **String** | The amount to be refunded from the original transaction, specified as a numeric string. This value cannot exceed the total amount of the original transaction.  | 
**category_names** | **[String]** | Custom categories to identify and track this refund transaction. Used for transaction classification and reporting. | [optional] 
**description** | **String** | Additional notes or description for the refund. | [optional] 


