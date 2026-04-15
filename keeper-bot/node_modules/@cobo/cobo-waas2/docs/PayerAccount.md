# CoboWaas2.PayerAccount

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**merchant_id** | **String** | The merchant ID. | 
**payer_id** | **String** | A unique identifier assigned by Cobo to track and identify individual payers. | 
**developer_fee_rate** | **String** | The developer fee rate applied to the top-up transactions made by the payer. Expressed as a decimal string where \&quot;0.1\&quot; represents 10%. | 
**created_timestamp** | **Number** | The creation time of the payer, represented as a UNIX timestamp in seconds. | [optional] 
**updated_timestamp** | **Number** | The last update time of the payer, represented as a UNIX timestamp in seconds. | [optional] 
**accounts** | [**[Account]**](Account.md) | An array of accounts associated with this payer. | [optional] 


