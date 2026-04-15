# CoboWaas2.SafeTxExtraData

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**to** | **String** | The recipient address of the transaction. | 
**value** | **String** | The human-readable transaction value, for example, &#x60;1 ETH&#x60;. | 
**data** | **String** | The transaction call data. | 
**domain_hash** | **String** | The EIP-712 domain separator hash. | 
**message_hash** | **String** | The hash of the structured message to be signed. | 
**safe_address** | **String** | The address of the Safe contract. | 
**safe_tx_hash** | **String** | The hash of the transaction. | 
**safe_nonce** | **Number** | The nonce of the transaction. | 
**operation** | **String** | The operation type for the transaction. | 
**gas_token_addr** | **String** | The address of the token used to pay gas. | [optional] 
**safe_tx_gas** | **Number** | The gas limit used for the transaction. | [optional] 
**base_gas** | **Number** | The base gas for the transaction. | [optional] 
**gas_price** | **String** | The gas price used in the transaction. | [optional] 
**refund_receiver** | **String** | The address used to receive the gas refund. | [optional] 
**to_contract_name** | **String** | The name of the recipient contract (if available). | [optional] 
**decoded_data** | [**SafeTxDecodedData**](SafeTxDecodedData.md) |  | [optional] 
**signature** | **String** | The signature of the transaction (if signed by Cobo Signer). | [optional] 
**wei** | **String** | The transaction amount in Wei. | [optional] 


