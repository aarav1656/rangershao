# CoboWaas2.ChainInfo

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**chain_id** | **String** | The chain ID, which is the unique identifier of a blockchain. | 
**symbol** | **String** | The chain symbol for display purposes, which is the abbreviated name of a chain. | [optional] 
**icon_url** | **String** | The URL of the chain icon. | [optional] 
**chain_identifier** | **String** | A functional identifier used to group blockchains with similar execution logic. For example, &#x60;ETH&#x60; for all EVM-compatible chains (Ethereum, BNB Smart Chain, Polygon). | [optional] 
**explorer_tx_url** | **String** | The transaction URL pattern on the blockchain explorer. You can use it to concatenate the transaction URLs. | [optional] 
**explorer_address_url** | **String** | The address URL pattern on the blockchain explorer. You can use it to concatenate the address URLs. | [optional] 
**require_memo** | **Boolean** | Whether the chain requires a memo. | [optional] 
**confirming_threshold** | **Number** | The number of confirmations required for an on-chain transaction, such as 64 for Ethereum. | [optional] 
**coinbase_maturity** | **Number** | The number of confirmations required before a coinbase transaction is considered mature and can be spent, for example, 100 confirmations for BTC. | [optional] 


