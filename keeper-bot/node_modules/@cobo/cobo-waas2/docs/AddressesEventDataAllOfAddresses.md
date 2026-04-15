# CoboWaas2.AddressesEventDataAllOfAddresses

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**address** | **String** | The wallet address. | 
**chain_id** | **String** | The chain ID, which is the unique identifier of a blockchain. You can retrieve the IDs of all the chains you can use by calling [List enabled chains](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-chains). | 
**memo** | **String** | The memo code. | [optional] 
**path** | **String** | The derivation path of the address. This property applies to MPC Wallets only. To learn the meaning of each level in the path, see [Path levels](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#path-levels). | [optional] 
**encoding** | [**AddressEncoding**](AddressEncoding.md) |  | [optional] 
**pubkey** | **String** | The public key of the address. This property applies to MPC Wallets only. | [optional] 
**x_only_pubkey** | **String** | The 32-byte x-only public key in hexadecimal format after tweaking. | [optional] 
**root_pubkey** | **String** | The root public key of the address. This property applies to MPC Wallets only. | [optional] 
**taproot_script_tree_hash** | **String** | The information about the new address. | [optional] 
**taproot_internal_address** | **String** | The Taproot address before tweaking. | [optional] 
**stellar_trusted_token_ids** | **[String]** | The list of token IDs for which this address has already established trustlines on the Stellar network. | [optional] 
**wallet_id** | **String** | The wallet ID. | 


