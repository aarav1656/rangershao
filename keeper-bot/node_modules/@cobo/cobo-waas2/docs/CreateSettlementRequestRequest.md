# CoboWaas2.CreateSettlementRequestRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**request_id** | **String** | The request ID that is used to track a settlement request. The request ID is provided by you and must be unique. | 
**acquiring_type** | [**AcquiringType**](AcquiringType.md) |  | [optional] 
**payout_channel** | [**PayoutChannel**](PayoutChannel.md) |  | [optional] 
**settlement_type** | [**SettlementType**](SettlementType.md) |  | [optional] 
**settlements** | [**[CreateSettlement]**](CreateSettlement.md) |  | 
**bank_account_id** | **String** |  The ID of the bank account where the funds will be deposited. You can call [List all bank accounts](https://www.cobo.com/payments/en/api-references/payment/list-all-bank-accounts) to retrieve the IDs of registered bank accounts.  This field is only applicable for off-ramp.  | [optional] 
**currency** | **String** | The fiat currency to receive after off-ramping. Currently, only &#x60;USD&#x60; is supported. Specify this field when &#x60;payout_channel&#x60; is set to &#x60;OffRamp&#x60;. | [optional] 
**remark** | **String** | The remark for the payout request. | [optional] 


