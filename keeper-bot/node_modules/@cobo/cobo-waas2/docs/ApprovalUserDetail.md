# CoboWaas2.ApprovalUserDetail

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **String** | Name of the user who approved the transaction. | [optional] 
**email** | **String** | Email of the user. | [optional] 
**pubkey** | **String** | Public key of the user. | [optional] 
**signature** | **String** | Signature produced by the user for this approval. | [optional] 
**statement_uuid** | **String** | UUID of the statement associated with this approval. | [optional] 
**result** | [**ApprovalResult**](ApprovalResult.md) |  | [optional] 
**approval_result_code** | **Number** | Integer value representing the result of the approval. | [optional] 
**created_time** | **Number** | Timestamp when the approval was created. | [optional] 
**template_version** | **String** | Version of the template used for the transaction approval. | [optional] 
**header_title** | **String** | Display title used in the transaction approval. | [optional] 
**is_for_sign** | **Boolean** | Indicates whether this approval requires signing: - &#x60;true&#x60;: The user must sign the transaction. - &#x60;false&#x60;: The user only needs to approve or reject without signing.  | [optional] 
**show_info** | **String** | Additional information to show for the transaction approval. | [optional] 
**language** | **String** | Language used for the transaction approval. | [optional] 
**message_version** | **String** | Version of the message format used for the transaction approval. | [optional] 
**message** | **String** | Message associated with the transaction approval. | [optional] 
**extra_message** | **String** | Any additional message or information related to the transaction approval. | [optional] 


