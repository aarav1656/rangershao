# CoboWaas2.MessageSignDestination

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**destination_type** | [**MessageSignDestinationType**](MessageSignDestinationType.md) |  | 
**message** | **String** | The raw data of the message to be signed, encoded in Base64 format. | 
**structured_data** | **{String: Object}** | The structured data to be signed, formatted as a JSON object according to the EIP-712 standard. | 
**message_bip137** | **String** | Message to be signed, in hexadecimal format. | 
**message_bip322** | **String** | Message to be signed, in hexadecimal format. | 
**message_cosmos_adr36** | **String** | Message to be signed, in hexadecimal format. | 


