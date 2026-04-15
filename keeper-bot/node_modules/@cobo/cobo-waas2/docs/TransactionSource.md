# CoboWaas2.TransactionSource

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**source_type** | [**TransactionSourceType**](TransactionSourceType.md) |  | 
**wallet_id** | **String** | The wallet ID. | 
**address** | **String** | The wallet address. | 
**included_utxos** | [**[TransactionUtxo]**](TransactionUtxo.md) |  | [optional] 
**excluded_utxos** | [**[TransactionUtxo]**](TransactionUtxo.md) |  | [optional] 
**signer_key_share_holder_group_id** | **String** | The ID of the key share holder group that is selected to sign the transaction. | [optional] 
**delegate** | [**CoboSafeDelegate**](CoboSafeDelegate.md) |  | [optional] 
**exchange_id** | [**ExchangeId**](ExchangeId.md) |  | 
**trading_account_type** | **String** | The exchange trading account or a sub-wallet ID. | [optional] 
**wallet_type** | [**WalletType**](WalletType.md) |  | 
**wallet_subtype** | [**WalletSubtype**](WalletSubtype.md) |  | 
**addresses** | **[String]** | A list of addresses. | 


