# CoboWaas2.MerchantBalance

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**merchant_id** | **String** | The merchant ID. | 
**token_id** | **String** | The token ID, which is a unique identifier that specifies both the blockchain network and cryptocurrency token in the format &#x60;{CHAIN}_{TOKEN}&#x60;. | 
**acquiring_type** | [**AcquiringType**](AcquiringType.md) |  | [optional] 
**total_received_amount** | **String** | The total amount of the token that has been received by the merchant. | [optional] 
**settled_amount** | **String** | The total amount of the token that has been paid out from the merchant&#39;s balance. | [optional] 
**payout_amount** | **String** | This field is reserved for future use. | [optional] 
**refunded_amount** | **String** | The total amount of the token that has been refunded from the merchant&#39;s balance. | [optional] 
**total_balance** | **String** |  The current balance of this token available to the merchant for payouts or refunds.  For more information, please refer to [Accounts and fund allocation](https://www.cobo.com/payments/en/guides/amounts-and-balances)  | [optional] 
**available_balance** | **String** | This field has been deprecated.  | [optional] 
**locked_balance** | **String** | This field is reserved for future use. | [optional] 


