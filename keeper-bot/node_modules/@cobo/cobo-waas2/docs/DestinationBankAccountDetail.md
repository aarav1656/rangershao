# CoboWaas2.DestinationBankAccountDetail

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**destination_id** | **String** | The destination ID. | 
**destination_name** | **String** | The name of the destination. | 
**destination_type** | [**DestinationType**](DestinationType.md) |  | 
**destination_email** | **String** | The email of the destination. | [optional] 
**destination_country** | **String** | The country of the destination, in ISO 3166-1 alpha-3 format. | [optional] 
**destination_contact_address** | **String** | The contact address of the destination. | [optional] 
**destination_merchant_id** | **String** | The ID of the merchant linked to the destination. | [optional] 
**bank_account_id** | **String** | The destination bank account ID. | 
**account_alias** | **String** | The alias of the bank account. | 
**account_number** | **String** | The bank account number. | 
**swift_code** | **String** | The SWIFT or BIC code of the bank. | 
**currency** | **String** | The currency of the bank account. | 
**beneficiary_name** | **String** | The name of the account holder. | 
**beneficiary_address** | **String** | The address of the account holder. | 
**bank_name** | **String** | The name of the bank. | 
**bank_address** | **String** | The address of the bank. | 
**iban_code** | **String** | The IBAN code of the bank account. | [optional] 
**further_credit** | **String** | The further credit of the bank account. | [optional] 
**intermediary_bank_info** | [**IntermediaryBankInfo**](IntermediaryBankInfo.md) |  | [optional] 
**bank_account_status** | [**BankAccountStatus**](BankAccountStatus.md) |  | 
**country** | **String** | Beneficiary&#39;s country, in ISO 3166-1 alpha-3 format. | [optional] 
**city** | **String** | Beneficiary&#39;s city. | [optional] 
**created_timestamp** | **Number** | The created time of the bank account, represented as a UNIX timestamp in seconds. | [optional] 
**updated_timestamp** | **Number** | The updated time of the bank account, represented as a UNIX timestamp in seconds. | [optional] 


