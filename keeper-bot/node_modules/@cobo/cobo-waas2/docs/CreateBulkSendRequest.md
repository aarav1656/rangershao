# CoboWaas2.CreateBulkSendRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**source_account** | **String** | The source account from which the bulk send will be made. - If the source account is a merchant account, provide the merchant&#39;s ID (e.g., \&quot;M1001\&quot;). - If the source account is the developer account, use the string &#x60;\&quot;developer\&quot;&#x60;.  | 
**execution_mode** | [**PaymentBulkSendExecutionMode**](PaymentBulkSendExecutionMode.md) |  | 
**description** | **String** | The description for the entire bulk send batch. | [optional] 
**payout_params** | [**[CreateBulkSendRequestPayoutParamsInner]**](CreateBulkSendRequestPayoutParamsInner.md) | The bulk send items. | 


