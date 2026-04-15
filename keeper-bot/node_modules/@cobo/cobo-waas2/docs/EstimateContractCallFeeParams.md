# CoboWaas2.EstimateContractCallFeeParams

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**request_id** | **String** | The request ID that is used to track a transaction request. | [optional] 
**request_type** | [**EstimateFeeRequestType**](EstimateFeeRequestType.md) |  | 
**chain_id** | **String** | The chain ID of the chain on which the smart contract is issued. You can retrieve the IDs of all the chains you can use by calling [List enabled chains](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-chains). | 
**source** | [**ContractCallSource**](ContractCallSource.md) |  | 
**destination** | [**ContractCallDestination**](ContractCallDestination.md) |  | [optional] 
**fee_type** | [**FeeType**](FeeType.md) |  | [optional] 
**replaced_transaction_id** | **String** | The ID of the transaction that this transaction replaced. | [optional] 


