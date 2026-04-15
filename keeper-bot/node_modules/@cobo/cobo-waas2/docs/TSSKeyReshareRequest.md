# CoboWaas2.TSSKeyReshareRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**old_group_id** | **String** | The old TSS key share group ID. | [optional] 
**root_pub_key** | **String** | The The old TSS key share group&#39;s root extended public key. | [optional] 
**curve** | [**TSSCurve**](TSSCurve.md) |  | [optional] 
**used_node_ids** | **[String]** |  | [optional] 
**old_threshold** | **Number** | The number of key share holders required to approve each operation in the old TSS key share group. | [optional] 
**new_threshold** | **Number** | The number of key share holders required to approve each operation in the new TSS key share group. | [optional] 
**new_node_ids** | **[String]** |  | [optional] 
**task_id** | **String** | The task ID. | [optional] 
**biz_task_id** | **String** | The business task ID. This field contains the TSS request ID. | [optional] 


