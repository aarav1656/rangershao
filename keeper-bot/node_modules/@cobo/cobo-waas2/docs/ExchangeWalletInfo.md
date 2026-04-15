# CoboWaas2.ExchangeWalletInfo

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**wallet_id** | **String** | The wallet ID. | 
**wallet_type** | [**WalletType**](WalletType.md) |  | 
**wallet_subtype** | [**WalletSubtype**](WalletSubtype.md) |  | 
**name** | **String** | The wallet name. | 
**org_id** | **String** | The ID of the owning organization. | 
**enable_auto_sweep** | **Boolean** | Enable the auto sweep feature for the wallet | [optional] 
**apikey** | **String** | The API key of your exchange account. | 
**exchange_id** | [**ExchangeId**](ExchangeId.md) |  | 
**main_wallet_id** | **String** | The wallet ID of the Main Account associated with the Sub Account. This property is returned only if you are creating or querying an Exchange Wallet (Sub Account). | [optional] 


