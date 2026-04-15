# CoboWaas2.TransactionEvmContractMethod

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **String** | The method name. | [optional] 
**sig** | **String** | The signature of the method, which includes the method name and parameter types. | [optional] 
**type** | **String** | The method type. | [optional] 
**payable** | **Boolean** | Whether the method is payable, which means it can receive tokens along with the transaction. - &#x60;true&#x60;: The method is payable. - &#x60;false&#x60;: The method is not payable.  | [optional] 
**selector** | **String** | The method selector, a four-byte identifier derived from the method&#39;s signature, used to invoke the method in a transaction. | [optional] 


