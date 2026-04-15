# CoboWaas2.ComplianceApi

All URIs are relative to *https://api.dev.cobo.com/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createKyaScreenings**](ComplianceApi.md#createKyaScreenings) | **POST** /compliance/kya/screenings | Create KYA address screening requests
[**getDispositionStatus**](ComplianceApi.md#getDispositionStatus) | **GET** /compliance/funds/disposition | Get disposition status
[**getKyaScreening**](ComplianceApi.md#getKyaScreening) | **GET** /compliance/kya/screenings/{screening_id} | Get KYA address screening result
[**getKytScreeningStatus**](ComplianceApi.md#getKytScreeningStatus) | **GET** /compliance/kyt/screenings/status | Get KYT screening status
[**isolateFunds**](ComplianceApi.md#isolateFunds) | **POST** /compliance/funds/disposition/isolate | Isolate funds
[**listKyaScreenings**](ComplianceApi.md#listKyaScreenings) | **GET** /compliance/kya/screenings | List KYA address screening results
[**refundFunds**](ComplianceApi.md#refundFunds) | **POST** /compliance/funds/disposition/refund | Refund funds
[**submitKytManualReview**](ComplianceApi.md#submitKytManualReview) | **POST** /compliance/kyt/screenings/manual_review | Submit KYT manual review result
[**submitKytScreeningDecisions**](ComplianceApi.md#submitKytScreeningDecisions) | **POST** /compliance/kyt/screenings/decisions | Submit KYT screening decision
[**unfreezeFunds**](ComplianceApi.md#unfreezeFunds) | **POST** /compliance/funds/disposition/unfreeze | Unfreeze frozen funds



## createKyaScreenings

> [KyaScreeningResult] createKyaScreenings(opts)

Create KYA address screening requests

This operation submits up to 50 address screening requests in one call to assess address compliance and risk levels.  &lt;Note&gt;This endpoint supports cross-chain address screening with independent idempotency for each address, enabling flexible error handling and partial retries.&lt;/Note&gt; 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.ComplianceApi();
const opts = {
  'CreateKyaScreeningsBody': new CoboWaas2.CreateKyaScreeningsBody()
};
apiInstance.createKyaScreenings(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **CreateKyaScreeningsBody** | [**CreateKyaScreeningsBody**](CreateKyaScreeningsBody.md)| The request body to create KYA address screening requests. | [optional] 

### Return type

[**[KyaScreeningResult]**](KyaScreeningResult.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## getDispositionStatus

> DispositionQueryResponse getDispositionStatus(transaction_id)

Get disposition status

This operation retrieves the current status of a disposition request for a specific transaction.  You can use this endpoint to check the status of any disposition operation (Refund, Isolate, or Unfreeze)  that has been initiated for a transaction. The response includes the disposition type, current status,  and the disposition transaction ID if applicable.  &lt;Note&gt;Use this endpoint to monitor the progress of disposition operations and verify their completion.&lt;/Note&gt; 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.ComplianceApi();
const transaction_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.getDispositionStatus(transaction_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **transaction_id** | **String**| The unique identifier (UUID) of the transaction to retrieve KYT screening status information for. | 

### Return type

[**DispositionQueryResponse**](DispositionQueryResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getKyaScreening

> KyaScreeningResult getKyaScreening(screening_id)

Get KYA address screening result

This operation retrieves a specific address screening result by &#x60;screening_id&#x60;, including risk assessment information.  &lt;Info&gt;This endpoint returns the full screening details including risk level, summary, and detailed risk category exposures.&lt;/Info&gt; 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.ComplianceApi();
const screening_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.getKyaScreening(screening_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **screening_id** | **String**| The unique identifier (UUID) of the address screening request. | 

### Return type

[**KyaScreeningResult**](KyaScreeningResult.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getKytScreeningStatus

> KytScreeningsTransaction getKytScreeningStatus(transaction_id)

Get KYT screening status

This operation retrieves the current KYT (Know Your Transaction) screening status, including review status and fund disposition status, for a specific transaction.  Use this endpoint to monitor the real-time screening progress for transactions processed through the KYT compliance system.  &lt;Note&gt;This endpoint provides comprehensive compliance monitoring capabilities to help maintain AML (Anti-Money Laundering) regulatory compliance and audit trail requirements.&lt;/Note&gt; 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.ComplianceApi();
const transaction_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.getKytScreeningStatus(transaction_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **transaction_id** | **String**| The unique identifier (UUID) of the transaction to retrieve KYT screening status information for. | 

### Return type

[**KytScreeningsTransaction**](KytScreeningsTransaction.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## isolateFunds

> DispositionResponse isolateFunds(opts)

Isolate funds

This operation creates a request to isolate funds for a specific transaction. The funds will be sent to a designated isolation address for compliance purposes.  You need to specify the transaction ID to be isolated and the destination address.  Optional parameters include custom categories for tracking purposes.  &lt;Note&gt;The isolation will initiate a withdrawal transaction from the compliance-managed address to the specified isolation address.&lt;/Note&gt; 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.ComplianceApi();
const opts = {
  'IsolateDisposition': new CoboWaas2.IsolateDisposition()
};
apiInstance.isolateFunds(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **IsolateDisposition** | [**IsolateDisposition**](IsolateDisposition.md)| The request body to isolate funds. | [optional] 

### Return type

[**DispositionResponse**](DispositionResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## listKyaScreenings

> ListKyaScreenings200Response listKyaScreenings(opts)

List KYA address screening results

This operation retrieves the results of specified screening requests with pagination support. You can filter specific screening requests using screening_ids (up to 50 IDs).  &lt;Note&gt;For larger result sets (exceeding 50 screening results), use pagination parameters (limit, before, after) to page through results.&lt;/Note&gt; 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.ComplianceApi();
const opts = {
  'screening_ids': "f47ac10b-58cc-4372-a567-0e02b2c3d479,a1b2c3d4-e5f6-4321-8765-fedcba987654",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listKyaScreenings(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **screening_ids** | **String**| A comma-separated list of screening request IDs to filter specific screening results. Maximum 50 IDs allowed to ensure URL length stays within standard web server limits (typically 8KB).  Each ID must be in standard UUID format (36 characters fixed length).  Example: &#x60;f47ac10b-58cc-4372-a567-0e02b2c3d479,a1b2c3d4-e5f6-4321-8765-fedcba987654&#x60;  | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListKyaScreenings200Response**](ListKyaScreenings200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## refundFunds

> DispositionResponse refundFunds(opts)

Refund funds

This operation creates a request to refund funds for a specific transaction. The funds will be sent to the specified destination address.  You need to specify the transaction ID to be refunded and the destination address.  Optional parameters include custom categories for tracking purposes.  &lt;Note&gt;The refund will initiate a withdrawal transaction from the compliance-managed address to the specified destination.&lt;/Note&gt; 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.ComplianceApi();
const opts = {
  'RefundDisposition': new CoboWaas2.RefundDisposition()
};
apiInstance.refundFunds(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **RefundDisposition** | [**RefundDisposition**](RefundDisposition.md)| The request body to refund funds. | [optional] 

### Return type

[**DispositionResponse**](DispositionResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## submitKytManualReview

> SubmitKytResponse submitKytManualReview(opts)

Submit KYT manual review result

This operation submits a manual review result for a KYT (Know Your Transaction) screening case that requires human analysis.  Use this endpoint when transactions flagged for manual review have been analyzed by compliance officers and require submission of review outcomes with detailed comments and justifications.  This endpoint is specifically designed for submitting comprehensive manual review findings rather than automated screening decisions.  &lt;Note&gt;Submitting a manual review result will update the KYT screening status and initiate appropriate compliance workflow actions based on the review outcome.&lt;/Note&gt; 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.ComplianceApi();
const opts = {
  'SubmitKytScreeningsReviewBody': new CoboWaas2.SubmitKytScreeningsReviewBody()
};
apiInstance.submitKytManualReview(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **SubmitKytScreeningsReviewBody** | [**SubmitKytScreeningsReviewBody**](SubmitKytScreeningsReviewBody.md)| The request body to submit a manual review result for a KYT screening case that requires human analysis. | [optional] 

### Return type

[**SubmitKytResponse**](SubmitKytResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## submitKytScreeningDecisions

> SubmitKytResponse submitKytScreeningDecisions(opts)

Submit KYT screening decision

This operation submits a KYT (Know Your Transaction) screening decision for a specific transaction based on an external compliance review.  Use this endpoint to provide a screening decision (Approval, ApprovalWithAlert, Rejection, or ManualReview) after completing the external KYT screening process.  The submitted decision will be recorded for compliance audit purposes and regulatory reporting requirements.  &lt;Note&gt;Submitting a screening decision will update the transaction&#39;s KYT status and may automatically trigger downstream compliance workflows or notifications depending on the decision type.&lt;/Note&gt; 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.ComplianceApi();
const opts = {
  'SubmitKytScreeningsDecisionsBody': new CoboWaas2.SubmitKytScreeningsDecisionsBody()
};
apiInstance.submitKytScreeningDecisions(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **SubmitKytScreeningsDecisionsBody** | [**SubmitKytScreeningsDecisionsBody**](SubmitKytScreeningsDecisionsBody.md)| The request body to submit a KYT screening decision for a specific transaction based on external compliance review. | [optional] 

### Return type

[**SubmitKytResponse**](SubmitKytResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## unfreezeFunds

> DispositionResponse unfreezeFunds(opts)

Unfreeze frozen funds

This operation creates a request to unfreeze funds for a previously frozen transaction. It releases the frozen funds back to their original state.  You only need to specify the transaction ID to be unfrozen. Once unfrozen, the funds will be available for normal operations.  &lt;Note&gt;The unfreeze process will release the compliance hold on the transaction, allowing it to proceed normally.&lt;/Note&gt; 

### Example

```javascript
const CoboWaas2 = require('@cobo/cobo-waas2');
// Initialize the API client
const apiClient = CoboWaas2.ApiClient.instance
// Select the development environment. To use the production environment, replace `Env.DEV` with `Env.PROD`
apiClient.setEnv(CoboWaas2.Env.DEV);
// Replace `<YOUR_PRIVATE_KEY>` with your private key
apiClient.setPrivateKey("<YOUR_PRIVATE_KEY>");
// Call the API
const apiInstance = new CoboWaas2.ComplianceApi();
const opts = {
  'UnfreezeDisposition': new CoboWaas2.UnfreezeDisposition()
};
apiInstance.unfreezeFunds(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **UnfreezeDisposition** | [**UnfreezeDisposition**](UnfreezeDisposition.md)| The request body to unfreeze funds. | [optional] 

### Return type

[**DispositionResponse**](DispositionResponse.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

