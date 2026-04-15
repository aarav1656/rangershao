# CoboWaas2.CreatedWalletInfo

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**wallet_id** | **String** | The wallet ID. | 
**wallet_type** | [**WalletType**](WalletType.md) |  | 
**wallet_subtype** | [**WalletSubtype**](WalletSubtype.md) |  | 
**name** | **String** | The wallet name. | 
**org_id** | **String** | The ID of the owning organization. | 
**enable_auto_sweep** | **Boolean** | Enable the auto sweep feature for the wallet | [optional] 
**project_id** | **String** | The project ID. | [optional] 
**project_name** | **String** | The project name. | [optional] 
**vault_id** | **String** | The ID of the owning vault. | 
**vault_name** | **String** | The vault name. | [optional] 
**apikey** | **String** | The API key of your exchange account. | 
**exchange_id** | [**ExchangeId**](ExchangeId.md) |  | 
**main_wallet_id** | **String** | The wallet ID of the Main Account associated with the Sub Account. This property is returned only if you are creating or querying an Exchange Wallet (Sub Account). | [optional] 


