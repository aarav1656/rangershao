# CoboWaas2.DestinationDetail

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**destination_id** | **String** | The destination ID. | 
**destination_type** | [**DestinationType**](DestinationType.md) |  | 
**destination_name** | **String** | The destination name. | 
**country** | **String** | The country of the destination, in ISO 3166-1 alpha-3 format. | [optional] 
**email** | **String** | The email of the destination. | [optional] 
**contact_address** | **String** | The contact address of the destination. | [optional] 
**wallet_addresses** | [**[WalletAddress]**](WalletAddress.md) | The wallet addresses of the destination. | [optional] 
**bank_accounts** | [**[DestinationBankAccount]**](DestinationBankAccount.md) | The bank accounts of the destination. | [optional] 
**merchant_id** | **String** | The ID of the merchant linked to the destination. | [optional] 
**created_timestamp** | **Number** | The created time of the destination, represented as a UNIX timestamp in seconds. | 
**updated_timestamp** | **Number** | The updated time of the destination, represented as a UNIX timestamp in seconds. | 


