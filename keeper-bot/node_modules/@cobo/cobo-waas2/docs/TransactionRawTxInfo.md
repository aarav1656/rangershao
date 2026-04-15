# CoboWaas2.TransactionRawTxInfo

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**used_nonce** | **Number** | The transaction nonce. | [optional] 
**selected_utxos** | [**[TransactionSelectedUtxo]**](TransactionSelectedUtxo.md) | The selected UTXOs to be consumed in the transaction. | [optional] 
**raw_tx** | **String** | The raw transaction data. | [optional] 
**unsigned_raw_tx** | **String** | The unsigned raw transaction data. | [optional] 
**utxo_change** | [**TransactionUtxoChange**](TransactionUtxoChange.md) | Deprecated. Use &#x60;utxo_changes&#x60; instead. | [optional] 
**utxo_changes** | [**[TransactionUtxoChange]**](TransactionUtxoChange.md) | The UTXO change outputs in the transaction. | [optional] 


