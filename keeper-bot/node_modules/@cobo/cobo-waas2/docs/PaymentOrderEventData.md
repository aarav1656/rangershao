# CoboWaas2.PaymentOrderEventData

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**data_type** | **String** |  The data type of the event. - &#x60;Transaction&#x60;: The transaction event data. - &#x60;TSSRequest&#x60;: The TSS request event data. - &#x60;Addresses&#x60;: The addresses event data. - &#x60;WalletInfo&#x60;: The wallet information event data. - &#x60;MPCVault&#x60;: The MPC vault event data. - &#x60;Chains&#x60;: The enabled chain event data. - &#x60;Tokens&#x60;: The enabled token event data. - &#x60;TokenListing&#x60;: The token listing event data.        - &#x60;PaymentOrder&#x60;: The payment order event data. - &#x60;PaymentRefund&#x60;: The payment refund event data. - &#x60;PaymentSettlement&#x60;: The payment settlement event data. - &#x60;PaymentTransaction&#x60;: The payment transaction event data. - &#x60;PaymentAddressUpdate&#x60;: The top-up address update event data. - &#x60;PaymentPayout&#x60;: The payment payout event data. - &#x60;PaymentBulkSend&#x60;: The payment bulk send event data. - &#x60;BalanceUpdateInfo&#x60;: The balance update event data. - &#x60;SuspendedToken&#x60;: The token suspension event data. - &#x60;ComplianceDisposition&#x60;: The compliance disposition event data. - &#x60;ComplianceKytScreenings&#x60;: The compliance KYT screenings event data. - &#x60;ComplianceKyaScreenings&#x60;: The compliance KYA screenings event data. | 
**order_id** | **String** | The order ID. | 
**merchant_id** | **String** | The merchant ID. | [optional] 
**merchant_order_code** | **String** | A unique reference code assigned by the merchant to identify this order in their system. | [optional] 
**psp_order_code** | **String** | A unique reference code assigned by the developer to identify this order in their system. | 
**pricing_currency** | **String** | The pricing currency of the order. | [optional] 
**pricing_amount** | **String** | The base amount of the order, excluding the developer fee (specified in &#x60;fee_amount&#x60;). | [optional] 
**fee_amount** | **String** | The developer fee for the order. It is added to the base amount to determine the final charge. | 
**payable_currency** | **String** | The ID of the cryptocurrency used for payment. | [optional] 
**chain_id** | **String** | The ID of the blockchain network where the payment transaction should be made. | 
**payable_amount** | **String** | The cryptocurrency amount to be paid for this order. | 
**exchange_rate** | **String** | The exchange rate between &#x60;payable_currency&#x60; and &#x60;pricing_currency&#x60;, calculated as (&#x60;pricing_amount&#x60; + &#x60;fee_amount&#x60;) / &#x60;payable_amount&#x60;.    &lt;Note&gt;This field is only returned when &#x60;payable_amount&#x60; was not provided in the order creation request. &lt;/Note&gt;  | 
**amount_tolerance** | **String** | The allowed amount deviation, with precision up to 1 decimal place.  For example, if &#x60;payable_amount&#x60; is &#x60;100.00&#x60; and &#x60;amount_tolerance&#x60; is &#x60;0.50&#x60;: - Payer pays 99.55 → Success (difference of 0.45 ≤ 0.5) - Payer pays 99.40 → Underpaid (difference of 0.60 &gt; 0.5)  | [optional] 
**receive_address** | **String** | The recipient wallet address to be used for the payment transaction. | 
**status** | [**OrderStatus**](OrderStatus.md) |  | 
**received_token_amount** | **String** | The total cryptocurrency amount received for this order. Updates until the expiration time. Precision matches the token standard (e.g., 6 decimals for USDT). | 
**expired_at** | **Number** | The expiration time of the pay-in order, represented as a UNIX timestamp in seconds. | [optional] 
**created_timestamp** | **Number** | The created time of the order, represented as a UNIX timestamp in seconds. | [optional] 
**updated_timestamp** | **Number** | The updated time of the order, represented as a UNIX timestamp in seconds. | [optional] 
**transactions** | [**[PaymentTransaction]**](PaymentTransaction.md) | An array of transactions associated with this pay-in order. Each transaction represents a separate blockchain operation related to the settlement process. | [optional] 
**currency** | **String** | This field has been deprecated. Please use &#x60;pricing_currency&#x60; instead. | [optional] 
**order_amount** | **String** | This field has been deprecated. Please use &#x60;pricing_amount&#x60; instead. | [optional] 
**token_id** | **String** | This field has been deprecated. Please use &#x60;payable_currency&#x60; instead. | [optional] 
**settlement_status** | [**SettleStatus**](SettleStatus.md) |  | [optional] 



## Enum: DataTypeEnum


* `Transaction` (value: `"Transaction"`)

* `TSSRequest` (value: `"TSSRequest"`)

* `Addresses` (value: `"Addresses"`)

* `WalletInfo` (value: `"WalletInfo"`)

* `MPCVault` (value: `"MPCVault"`)

* `Chains` (value: `"Chains"`)

* `Tokens` (value: `"Tokens"`)

* `TokenListing` (value: `"TokenListing"`)

* `PaymentOrder` (value: `"PaymentOrder"`)

* `PaymentRefund` (value: `"PaymentRefund"`)

* `PaymentSettlement` (value: `"PaymentSettlement"`)

* `PaymentTransaction` (value: `"PaymentTransaction"`)

* `PaymentAddressUpdate` (value: `"PaymentAddressUpdate"`)

* `PaymentPayout` (value: `"PaymentPayout"`)

* `PaymentBulkSend` (value: `"PaymentBulkSend"`)

* `BalanceUpdateInfo` (value: `"BalanceUpdateInfo"`)

* `SuspendedToken` (value: `"SuspendedToken"`)

* `ComplianceDisposition` (value: `"ComplianceDisposition"`)

* `ComplianceKytScreenings` (value: `"ComplianceKytScreenings"`)

* `ComplianceKyaScreenings` (value: `"ComplianceKyaScreenings"`)

* `unknown_default_open_api` (value: `"unknown_default_open_api"`)




