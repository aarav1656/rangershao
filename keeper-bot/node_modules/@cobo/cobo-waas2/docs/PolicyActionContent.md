# CoboWaas2.PolicyActionContent

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | **String** | The quorum type. Possible values include:    - &#x60;FULL_APPROVAL&#x60;: Requires approval from all participants.   - &#x60;PART_APPROVAL&#x60;: Requires approval from a specified number of participants.  | 
**roles** | **[String]** | The roles included in the quorum. Possible values include &#x60;admin&#x60;, &#x60;spender&#x60;, &#x60;operator&#x60;, and &#x60;approver&#x60;. | [optional] 
**user_ids** | **[String]** | The ID of the users included in the quorum. | [optional] 
**threshold** | **Number** | The number of approvers required to meet the quorum. | [optional] 



## Enum: TypeEnum


* `FULL_APPROVAL` (value: `"FULL_APPROVAL"`)

* `PART_APPROVAL` (value: `"PART_APPROVAL"`)

* `unknown_default_open_api` (value: `"unknown_default_open_api"`)




