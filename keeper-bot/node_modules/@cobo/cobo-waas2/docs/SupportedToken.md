# CoboWaas2.SupportedToken

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**token_id** | **String** | The unique identifier of the token, in the format of &#x60;{chain_id}_{token_symbol}&#x60;. | 
**name** | **String** | The full name of the token. | 
**symbol** | **String** | The symbol of the token. | 
**decimal** | **Number** | The number of decimal places for the token. This value is used to convert  between the token&#39;s smallest unit and its display value.  | 
**token_address** | **String** | The contract address of the token. This is &#x60;null&#x60; for native coins (e.g., ETH on Ethereum).  | 
**chain_id** | **String** | The ID of the chain on which the token exists. | 
**chain_symbol** | **String** | The symbol of the chain on which the token exists. | 
**chain_icon_url** | **String** | The URL of the chain icon image. | [optional] 
**token_icon_url** | **String** | The URL of the token icon image. | [optional] 
**can_off_ramp** | **Boolean** | Whether the token supports fiat off-ramp. - &#x60;true&#x60;: The token can be used for fiat off-ramp. - &#x60;false&#x60;: The token cannot be used for fiat off-ramp.  | [optional] 


