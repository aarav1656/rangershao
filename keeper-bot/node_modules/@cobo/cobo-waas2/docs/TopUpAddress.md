# CoboWaas2.TopUpAddress

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**address** | **String** | The dedicated top-up address assigned to a specific payer under a merchant on a specified chain. | 
**payer_id** | **String** | A unique identifier assigned by Cobo to track and identify individual payers. | 
**custom_payer_id** | **String** | A unique identifier assigned by the developer to track and identify individual payers in their system. | 
**merchant_id** | **String** | The merchant ID. | 
**token_id** | **String** | The token ID, which is a unique identifier that specifies both the blockchain network and cryptocurrency token in the format &#x60;{CHAIN}_{TOKEN}&#x60;. | 
**chain** | **String** | The chain ID. | [optional] 
**developer_fee_rate** | **String** | The developer fee rate applied to top-up transactions made to this address. Expressed as a decimal string where \&quot;0.1\&quot; represents 10%. | [optional] 
**min_amount** | **String** | The minimum top-up amount allowed for this address. Top-ups below this threshold will not be credited to merchant or developer funds. | 
**created_timestamp** | **Number** | The creation time of the top-up address, represented as a UNIX timestamp in seconds. | [optional] 
**updated_timestamp** | **Number** | The last update time of the top-up address, represented as a UNIX timestamp in seconds. | [optional] 


