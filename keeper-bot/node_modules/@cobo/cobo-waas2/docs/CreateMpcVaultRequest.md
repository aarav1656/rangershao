# CoboWaas2.CreateMpcVaultRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**project_id** | **String** | The project ID, which you can retrieve by calling [List all projects](https://www.cobo.com/developers/v2/api-references/wallets--mpc-wallets/list-all-projects).  **Notes:** 1. If you set &#x60;vault_type&#x60; to &#x60;OrgControlled&#x60;, the value of &#x60;project_id&#x60; will be ignored. 2. If you set &#x60;vault_type&#x60; to &#x60;UserControlled&#x60;, then &#x60;project_id&#x60; is required.  | [optional] 
**name** | **String** | The vault name. | 
**vault_type** | [**MPCVaultType**](MPCVaultType.md) |  | 


