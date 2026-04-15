# CoboWaas2.Pagination

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**before** | **String** | An object ID used to retrieve records before the specified object, indicating earlier or smaller records relative to the current dataset. You can use it to paginate backwards.   If empty, it means you have reached the start of the data.    Most API endpoints sort by object ID, but some use other fields depending on the endpoint.  | 
**after** | **String** | An object ID used to retrieve records after the specified object, indicating newer or larger records relative to the current dataset. You can use it to paginate forwards.    If empty, it means you have reached the end of the data.    Most API endpoints sort by object ID, but some use other fields depending on the endpoint.  | 
**total_count** | **Number** | The total number of records that match the query criteria, unaffected by the pagination parameters (&#x60;before&#x60; , &#x60;after&#x60;, and &#x60;limit&#x60;). | 


