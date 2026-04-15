# CoboWaas2.TransactionTokeApproval

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**token_id** | **String** | The token ID, which is the unique identifier of a token. | 
**chain_id** | **String** | The ID of the chain on which the token operates. | 
**asset_id** | **String** | (This concept applies to Exchange Wallets only) The asset ID. An asset ID is the unique identifier of the asset held within your linked exchange account. | [optional] 
**symbol** | **String** | The token symbol, which is the abbreviated name of a token. | [optional] 
**name** | **String** | The token name, which is the full name of a token. | [optional] 
**decimal** | **Number** | The token decimal. | [optional] 
**icon_url** | **String** | The URL of the token icon. | [optional] 
**token_address** | **String** | The token address, if applicable. | [optional] 
**fee_token_id** | **String** | The fee token ID. A fee token is the token with which you pay transaction fees. | [optional] 
**can_deposit** | **Boolean** | Whether deposits are enabled for this token. | [optional] 
**can_withdraw** | **Boolean** | Whether withdrawals are enabled for this token. | [optional] 
**dust_threshold** | **String** | The minimum withdrawal amount for Custodial Wallets. If your withdrawal amount is smaller than this threshold, the withdrawal request will receive an error.  Note: [Cobo Loop](https://manuals.cobo.com/en/portal/custodial-wallets/cobo-loop) transfers do not have this limitation.  | [optional] 
**custodial_minimum_deposit_threshold** | **String** | The minimum deposit amount for Custodial Wallets. If the amount you deposit to a Custodial Wallet is smaller than this threshold, the deposit will not show up on Cobo Portal or trigger any webhook events.  Note: [Cobo Loop](https://manuals.cobo.com/en/portal/custodial-wallets/cobo-loop)transfers do not have this limitation.  | [optional] 
**asset_model_type** | [**TokenAssetModelType**](TokenAssetModelType.md) |  | [optional] 
**amount** | **Number** | Transaction value (Note that this is an absolute value. If you trade 1.5 BTC, then the value is 1.5)  | [optional] 
**spender** | **String** | Spender address | [optional] 


