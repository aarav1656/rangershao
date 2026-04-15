# CoboWaas2.KeyShareHolder

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **String** | The key share holder name. | [optional] 
**type** | [**KeyShareHolderType**](KeyShareHolderType.md) |  | [optional] 
**tss_node_id** | **String** | The key share holder&#39;s TSS Node ID. | [optional] 
**online** | **Boolean** | Whether the key share holder&#39;s TSS Node is online. - &#x60;true&#x60;: The TSS Node is online.  - &#x60;false&#x60;: The TSS Node is offline.  | [optional] 
**signer** | **Boolean** | Whether the key share holder has been selected as the designated transaction signer. For example, in a 2-3 [Threshold Signature Scheme (TSS)](https://manuals.cobo.com/en/portal/mpc-wallets/introduction#threshold-signature-scheme-tss), Cobo will serve as one signer, and you can choose one of the other two key share holders to act as the second transaction signer. - &#x60;true&#x60;: The key share holder is a designated transaction signer.  - &#x60;false&#x60;: The key share holder is not a designated transaction signer.  | [optional] 
**status** | [**KeyShareHolderStatus**](KeyShareHolderStatus.md) |  | [optional] 
**account_id** | **String** | The key share holder&#39;s Cobo Portal account ID. | [optional] 


