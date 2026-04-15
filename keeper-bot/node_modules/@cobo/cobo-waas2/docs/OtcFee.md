# CoboWaas2.OtcFee

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**fee_rate** | **String** | The exchange rate used to convert cryptos to fiat currencies during off-ramp. The final fiat amount is calculated using the following formula:  Final Fiat Amount &#x3D; (Token Amount - Bridging Fee) × Exchange Rate  Note: The actual fiat amount received may be lower due to additional bank transfer fees.  | 
**token_id** | **String** | The ID of the token you want to off-ramp. | [optional] 


