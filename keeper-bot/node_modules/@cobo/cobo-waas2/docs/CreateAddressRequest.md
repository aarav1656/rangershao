# CoboWaas2.CreateAddressRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**chain_id** | **String** | The chain ID, which is the unique identifier of a blockchain. You can retrieve the IDs of all the chains you can use by calling [List enabled chains](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-chains). | 
**count** | **Number** | The number of addresses to create. This property will be ignored if you are generating tweaked Taproot addresses. | [default to 1]
**taproot_script_tree_hashes** | **[String]** | A list of script tree hashes used to generate a tweaked Taproot address. This property is required only if you want to generate tweaked Taproot addresses. | [optional] 
**taproot_internal_address** | **String** | The original Taproot address to be tweaked. This property is required only if you want to generate tweaked Taproot addresses. | [optional] 
**encoding** | [**AddressEncoding**](AddressEncoding.md) |  | [optional] 


