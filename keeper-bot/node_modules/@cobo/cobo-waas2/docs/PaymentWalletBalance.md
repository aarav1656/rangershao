# CoboWaas2.PaymentWalletBalance

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**wallet_id** | **String** | The unique identifier of the wallet. | 
**token_id** | **String** | The token ID, which is a unique identifier that specifies both the blockchain network and cryptocurrency token in the format &#x60;{CHAIN}_{TOKEN}&#x60;. | 
**swept_balance** | **String** | The total amount of the token on the sweep-to address of the payment wallet. | [optional] 
**available_balance** | **String** | The balance available for settlement or refund, in the specified cryptocurrency. | [optional] 
**total_balance** | **String** | The total balance of the token for the payment wallet. | [optional] 
**above_sweep_threshold_balance** | **String** | The total amount of funds that exceed the sweep threshold across all receiving addresses in the payment wallet. When the balance on a receiving address exceeds the sweep threshold, those funds become eligible for automatic sweeping and are included in this balance. | [optional] 


