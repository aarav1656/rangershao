# CoboWaas2.DestinationBankAccount

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
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
**created_timestamp** | **Number** | The created time of the bank account, represented as a UNIX timestamp in seconds. | [optional] 
**updated_timestamp** | **Number** | The updated time of the bank account, represented as a UNIX timestamp in seconds. | [optional] 
**country** | **String** | Beneficiary&#39;s country, in ISO 3166-1 alpha-3 format. | [optional] 
**city** | **String** | Beneficiary&#39;s city. | [optional] 


