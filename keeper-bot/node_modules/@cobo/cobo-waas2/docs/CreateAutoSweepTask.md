# CoboWaas2.CreateAutoSweepTask

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**wallet_id** | **String** | ID of the wallet where the token will be swept. | 
**token_id** | **String** | ID of the token to be swept. You can retrieve the IDs of all the tokens you can use by calling [List enabled tokens](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-tokens). | 
**min_balance_threshold** | **String** | The minimum token balance threshold for auto sweep. If the token balance of an address is less than this threshold, the address will not be swept.  | [optional] 


