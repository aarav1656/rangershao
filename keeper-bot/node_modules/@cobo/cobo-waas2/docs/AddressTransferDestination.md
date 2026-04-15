# CoboWaas2.AddressTransferDestination

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**destination_type** | [**TransferDestinationType**](TransferDestinationType.md) |  | 
**account_output** | [**AddressTransferDestinationAccountOutput**](AddressTransferDestinationAccountOutput.md) |  | [optional] 
**utxo_outputs** | [**[AddressTransferDestinationUtxoOutputsInner]**](AddressTransferDestinationUtxoOutputsInner.md) |  | [optional] 
**change_address** | **String** | The address used to receive the remaining funds or change from the transaction. | [optional] 
**change_output_type** | **String** | The position of the change output in the transaction&#39;s outputs. Possible values are: - &#x60;Last&#x60;: The change output is placed at the end of the transaction&#39;s outputs.   - &#x60;First&#x60;: The change output is placed at the beginning of the transaction&#39;s outputs.  | [optional] 
**force_internal** | **Boolean** | Whether the transaction request must be executed as a [Cobo Loop](https://manuals.cobo.com/en/portal/custodial-wallets/cobo-loop) transfer.   - &#x60;true&#x60;: The transaction request must be executed as a Cobo Loop transfer.   - &#x60;false&#x60;: The transaction request may not be executed as a Cobo Loop transfer.    Please do not set both &#x60;force_internal&#x60; and &#x60;force_external&#x60; as &#x60;true&#x60;. If both are set to &#x60;false&#x60;, the system uses Cobo Loop by default if possible; otherwise, it proceeds with an on-chain transfer.  | [optional] 
**force_external** | **Boolean** | Whether the transaction request must not be executed as a [Cobo Loop](https://manuals.cobo.com/en/portal/custodial-wallets/cobo-loop) transfer.   - &#x60;true&#x60;: The transaction request must not be executed as a Cobo Loop transfer.   - &#x60;false&#x60;: The transaction request can be executed as a Cobo Loop transfer.  Please do not set both &#x60;force_internal&#x60; and &#x60;force_external&#x60; as &#x60;true&#x60;. If both are set to &#x60;false&#x60;, the system uses Cobo Loop by default if possible; otherwise, it proceeds with an on-chain transfer.  | [optional] 



## Enum: ChangeOutputTypeEnum


* `Last` (value: `"Last"`)

* `First` (value: `"First"`)

* `unknown_default_open_api` (value: `"unknown_default_open_api"`)




