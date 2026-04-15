# CoboWaas2.TravelRuleDepositExchangesOrVASPEntityInfo

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**selected_entity_type** | **String** | Specifies the type of entity associated with the transaction. - &#x60;LEGAL&#x60;: Legal entity. - &#x60;NATURAL&#x60;: Natural person.  | 
**legal_name** | **String** | The legal name of the entity. | 
**date_of_incorporation** | **Date** | The date of incorporation of the entity. This field is required when either of the following conditions is met: - &#x60;is_threshold_reached&#x60; is &#x60;true&#x60; in the response of the [Retrieve transaction limitations](https://www.cobo.com/developers/v2/api-references/travelrule/retrieve-transaction-limitations) operation. - &#x60;selected_entity_type&#x60; is &#x60;LEGAL&#x60;.  | [optional] 
**place_of_incorporation** | **String** | The place of incorporation of the entity. This field is required when either of the following conditions is met: - &#x60;is_threshold_reached&#x60; is &#x60;true&#x60; in the response of the [Retrieve transaction limitations](https://www.cobo.com/developers/v2/api-references/travelrule/retrieve-transaction-limitations) operation. - &#x60;selected_entity_type&#x60; is &#x60;LEGAL&#x60;.  | [optional] 
**first_name** | **String** | The first name of the natural person. | 
**last_name** | **String** | The last name of the natural person. | 
**date_of_birth** | **Date** | The date of birth of the natural person. This field is required when either of the following conditions is met: - &#x60;is_threshold_reached&#x60; is &#x60;true&#x60; in the response of the [Retrieve transaction limitations](https://www.cobo.com/developers/v2/api-references/travelrule/retrieve-transaction-limitations) operation. - &#x60;selected_entity_type&#x60; is &#x60;NATURAL&#x60;.  | [optional] 
**place_of_birth** | **String** | The place of birth of the natural person. This field is required when either of the following conditions is met: - &#x60;is_threshold_reached&#x60; is &#x60;true&#x60; in the response of the [Retrieve transaction limitations](https://www.cobo.com/developers/v2/api-references/travelrule/retrieve-transaction-limitations) operation. - &#x60;selected_entity_type&#x60; is &#x60;NATURAL&#x60;.  | [optional] 



## Enum: SelectedEntityTypeEnum


* `LEGAL` (value: `"LEGAL"`)

* `NATURAL` (value: `"NATURAL"`)

* `unknown_default_open_api` (value: `"unknown_default_open_api"`)




