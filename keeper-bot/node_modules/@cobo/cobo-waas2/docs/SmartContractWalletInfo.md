# CoboWaas2.SmartContractWalletInfo

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**wallet_id** | **String** | The wallet ID. | 
**wallet_type** | [**WalletType**](WalletType.md) |  | 
**wallet_subtype** | [**WalletSubtype**](WalletSubtype.md) |  | 
**name** | **String** | The wallet name. | 
**org_id** | **String** | The ID of the owning organization. | 
**enable_auto_sweep** | **Boolean** | Enable the auto sweep feature for the wallet | [optional] 
**chain_id** | **String** | The ID of the chain on which the wallet operates. | [optional] 
**smart_contract_wallet_type** | [**SmartContractWalletType**](SmartContractWalletType.md) |  | 
**safe_address** | **String** | The Smart Contract Wallet address. | [optional] 
**signers** | **[String]** | The signers of the Smart Contract Wallet. | [optional] 
**threshold** | **Number** | The minimum number of confirmations required for the Smart Contract Wallet.  | [optional] 
**cobo_safe_address** | **String** | The address of Cobo Safe. | [optional] 
**initiator** | [**SmartContractInitiator**](SmartContractInitiator.md) |  | [optional] 


