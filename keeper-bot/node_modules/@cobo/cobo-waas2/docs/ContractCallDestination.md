# CoboWaas2.ContractCallDestination

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**destination_type** | [**ContractCallDestinationType**](ContractCallDestinationType.md) |  | 
**address** | **String** | The destination address. | 
**value** | **String** | The transfer amount. For example, if you trade 1.5 TRX, then the value is &#x60;1.5&#x60;.  | [optional] 
**calldata** | **String** | The data that is used to invoke a specific function or method within the specified contract at the destination address.  | 
**instructions** | [**[SolContractCallInstruction]**](SolContractCallInstruction.md) |  | 
**address_lookup_table_accounts** | [**[SolContractCallAddressLookupTableAccount]**](SolContractCallAddressLookupTableAccount.md) |  | [optional] 
**contract_param** | [**StellarContractCallContractParam**](StellarContractCallContractParam.md) |  | 
**cosmos_messages** | [**[CosmosContractCallMessage]**](CosmosContractCallMessage.md) |  | 


