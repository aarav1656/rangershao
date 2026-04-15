# CoboWaas2.Scopes

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**wallet_types** | [**[WalletType]**](WalletType.md) | The list of wallet types that this API key can access. Possible values include:   - &#x60;Custodial&#x60;: [Custodial Wallets](https://manuals.cobo.com/en/portal/custodial-wallets/introduction)   - &#x60;MPC&#x60;: [MPC Wallets](https://manuals.cobo.com/en/portal/mpc-wallets/introduction)   - &#x60;SmartContract&#x60;: [Smart Contract Wallets](https://manuals.cobo.com/en/portal/smart-contract-wallets/introduction)   - &#x60;Exchange&#x60;: [Exchange Wallets](https://manuals.cobo.com/en/portal/exchange-wallets/introduction)  | [optional] 
**wallet_subtypes** | [**[WalletSubtype]**](WalletSubtype.md) | The list of wallet sub-types that this API key can access. Possible values include:   - &#x60;Asset&#x60;: Custodial Wallets (Asset Wallets).   - &#x60;Org-Controlled&#x60;: MPC Wallets (Organization-Controlled Wallets).   - &#x60;User-Controlled&#x60;: MPC Wallets (User-Controlled Wallets).   - &#x60;Safe{Wallet}&#x60;: Smart Contract Wallets (Safe).   - &#x60;Main&#x60;: Exchange Wallets (Main Account).   - &#x60;Sub&#x60;: Exchange Wallets (Sub Account).  | [optional] 
**wallet_ids** | **[String]** | The list of wallet IDs that this API key can access. | [optional] 
**vault_ids** | **[String]** | (Applicable to MPC Wallets only) The list of vault IDs that this API key can access. | [optional] 
**project_ids** | **[String]** | (Applicable to MPC Wallets only) The list of project IDs that this API key can access. | [optional] 


