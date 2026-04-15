# CoboWaas2.CreateExchangeWalletParams

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **String** | The wallet name. | 
**wallet_type** | [**WalletType**](WalletType.md) |  | 
**wallet_subtype** | [**WalletSubtype**](WalletSubtype.md) |  | 
**enable_auto_sweep** | **Boolean** | Enable the auto-sweep feature for the wallet. This parameter only applies to MPC Wallets and Custodial Wallets (Web3 Wallets). | [optional] 
**exchange_id** | [**ExchangeId**](ExchangeId.md) |  | 
**apikey** | **String** | The API key of your exchange account. | 
**secret** | **String** | The API secret of your exchange account. | 
**passphrase** | **String** | The passphrase of your exchange account. | [optional] 
**memo** | **String** | The memo you use when applying for the API key of your exchange account. | [optional] 
**account_identify** | **String** | The identifier of your exchange account. - For Binance, this is email address of your exchange account. - For OKX, this is the user name of your exchange account.  | [optional] 
**ga_code** | **String** | The GA code for the exchange. | [optional] 
**main_wallet_id** | **String** | The ID of the Exchange Wallet (Main Account). | [optional] 


