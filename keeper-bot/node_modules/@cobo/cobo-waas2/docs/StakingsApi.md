# CoboWaas2.StakingsApi

All URIs are relative to *https://api.dev.cobo.com/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createBabylonAirdropRegistration**](StakingsApi.md#createBabylonAirdropRegistration) | **POST** /stakings/protocols/babylon/airdrops/registrations | Register for Babylon airdrop
[**createBabylonStakingExpansion**](StakingsApi.md#createBabylonStakingExpansion) | **POST** /stakings/protocols/babylon/stakings/expansions | Expand Babylon BTC staking
[**createBabylonStakingRegistration**](StakingsApi.md#createBabylonStakingRegistration) | **POST** /stakings/protocols/babylon/stakings/registrations | Register for Babylon Phase-2
[**createClaimActivity**](StakingsApi.md#createClaimActivity) | **POST** /stakings/activities/claim | Create claim activity
[**createStakeActivity**](StakingsApi.md#createStakeActivity) | **POST** /stakings/activities/stake | Create stake activity
[**createUnstakeActivity**](StakingsApi.md#createUnstakeActivity) | **POST** /stakings/activities/unstake | Create unstake activity
[**createWithdrawActivity**](StakingsApi.md#createWithdrawActivity) | **POST** /stakings/activities/withdraw | Create withdraw activity
[**getBabylonAirdropRegistrationById**](StakingsApi.md#getBabylonAirdropRegistrationById) | **GET** /stakings/protocols/babylon/airdrops/registrations/{registration_id} | Get Babylon airdrop registration details
[**getBabylonStakingRegistrationById**](StakingsApi.md#getBabylonStakingRegistrationById) | **GET** /stakings/protocols/babylon/stakings/registrations/{registration_id} | Get Babylon Phase-2 registration details
[**getStakingActivityById**](StakingsApi.md#getStakingActivityById) | **GET** /stakings/activities/{activity_id} | Get staking activity details
[**getStakingById**](StakingsApi.md#getStakingById) | **GET** /stakings/{staking_id} | Get staking position details
[**getStakingEstimationFee**](StakingsApi.md#getStakingEstimationFee) | **POST** /stakings/estimate_fee | Estimate staking fees
[**getStakingEstimationFeeV2**](StakingsApi.md#getStakingEstimationFeeV2) | **POST** /stakings/estimate_fee_v2 | Estimate staking fees v2
[**getStakingPoolById**](StakingsApi.md#getStakingPoolById) | **GET** /stakings/pools/{pool_id} | Get staking pool details
[**listBabylonAirdropRegistrations**](StakingsApi.md#listBabylonAirdropRegistrations) | **GET** /stakings/protocols/babylon/airdrops/registrations | List Babylon airdrop registrations
[**listBabylonEligibleAirdrops**](StakingsApi.md#listBabylonEligibleAirdrops) | **GET** /stakings/protocols/babylon/airdrops/eligibles | List wallets eligible for Babylon airdrop
[**listBabylonEligibleStakings**](StakingsApi.md#listBabylonEligibleStakings) | **GET** /stakings/protocols/babylon/stakings/eligibles | List staking positions eligible for Babylon Phase-2
[**listBabylonStakingRegistrations**](StakingsApi.md#listBabylonStakingRegistrations) | **GET** /stakings/protocols/babylon/stakings/registrations | List Babylon Phase-2 registrations
[**listStakingActivities**](StakingsApi.md#listStakingActivities) | **GET** /stakings/activities | List staking activities
[**listStakingPools**](StakingsApi.md#listStakingPools) | **GET** /stakings/pools | List staking pools
[**listStakings**](StakingsApi.md#listStakings) | **GET** /stakings | List staking positions



## createBabylonAirdropRegistration

> CreateBabylonAirdropRegistration201Response createBabylonAirdropRegistration(opts)

Register for Babylon airdrop

This operation initiates a Babylon airdrop registration request.   Before calling this operation, please ensure the following: - The Bitcoin (BTC) address is eligible for the Babylon airdrop and has not been registered. You can call the [List wallets eligible for Babylon airdrop](https://www.cobo.com/developers/v2/api-references/stakings/list-wallets-eligible-for-babylon-airdrop) operation to check the registration status. - The Babylon address has enough asset to pay for the registration fee. - The Babylon address must be a Babylon address in an MPC Wallet in your organization.  The system first checks whether the provided address is eligible for the Babylon airdrop. If eligible, it creates a unique registration ID, which can be used to track the status.   The registration is processed asynchronously and may take some time to complete. It is recommended that you regularly call the [Get Babylon airdrop registration details](https://www.cobo.com/developers/v2/api-references/stakings/get-babylon-airdrop-registration-details) operation to check the status and handle registration accordingly.  For more information, refer to [Babylon&#39;s official doc](https://github.com/babylonlabs-io/babylon/tree/main/docs). 

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
const apiInstance = new CoboWaas2.StakingsApi();
const opts = {
  'CreateBabylonAirdropRegistrationRequest': new CoboWaas2.CreateBabylonAirdropRegistrationRequest()
};
apiInstance.createBabylonAirdropRegistration(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **CreateBabylonAirdropRegistrationRequest** | [**CreateBabylonAirdropRegistrationRequest**](CreateBabylonAirdropRegistrationRequest.md)| The request body to register for the Babylon airdrop. | [optional] 

### Return type

[**CreateBabylonAirdropRegistration201Response**](CreateBabylonAirdropRegistration201Response.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## createBabylonStakingExpansion

> Stakings createBabylonStakingExpansion(opts)

Expand Babylon BTC staking

This operation initiates a Babylon BTC staking expansion request.   Before calling this operation, please ensure the following: - The BTC staking position is active. - The finality provider public keys are valid. Each BSN chain can have at most one finality provider public key.  The system first checks whether the provided BTC staking position is active. If active, it creates a new BTC staking position for the Phase-3 expansion.  The expansion is processed asynchronously and may take some time to complete.  For more information, refer to [Babylon&#39;s official doc](https://github.com/babylonlabs-io/babylon/tree/main/docs). 

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
const apiInstance = new CoboWaas2.StakingsApi();
const opts = {
  'BabylonCreateStakingExpansion': new CoboWaas2.BabylonCreateStakingExpansion()
};
apiInstance.createBabylonStakingExpansion(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **BabylonCreateStakingExpansion** | [**BabylonCreateStakingExpansion**](BabylonCreateStakingExpansion.md)| The request body to expand Babylon BTC staking to Phase-3 | [optional] 

### Return type

[**Stakings**](Stakings.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## createBabylonStakingRegistration

> CreateBabylonStakingRegistration201Response createBabylonStakingRegistration(opts)

Register for Babylon Phase-2

This operation initiates a Babylon Phase-2 registration request.   Before calling this operation, please ensure the following: - The staking position is eligible for the Babylon Phase-2 and has not been registered. You can call the [List staking positions eligible for Babylon Phase-2](https://www.cobo.com/developers/v2/api-references/stakings/list-staking-positions-eligible-for-babylon-phase-2) operation to check the registration status. - The Babylon address has enough asset to pay for the registration fee. - The Babylon address must be a Babylon address in an MPC Wallet in your organization.  The system first checks whether the provided address is eligible for Phase-2. If eligible, it creates a unique registration ID, which can be used to track the status.   The registration is processed asynchronously and may take some time to complete. It is recommended that you regularly call the [Get Babylon Phase-2 registration details](https://www.cobo.com/developers/v2/api-references/stakings/get-babylon-phase-2-registration-details) operation to check the status and handle registration accordingly.  For more information, refer to [Babylon&#39;s official doc](https://github.com/babylonlabs-io/babylon/tree/main/docs). 

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
const apiInstance = new CoboWaas2.StakingsApi();
const opts = {
  'CreateBabylonStakingRegistrationRequest': new CoboWaas2.CreateBabylonStakingRegistrationRequest()
};
apiInstance.createBabylonStakingRegistration(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **CreateBabylonStakingRegistrationRequest** | [**CreateBabylonStakingRegistrationRequest**](CreateBabylonStakingRegistrationRequest.md)| The request body to transit Babylon BTC staking to Phase-2 | [optional] 

### Return type

[**CreateBabylonStakingRegistration201Response**](CreateBabylonStakingRegistration201Response.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## createClaimActivity

> CreateStakeActivity201Response createClaimActivity(opts)

Create claim activity

This operation creates a claim request.  &lt;Note&gt;Currently, only the Ethereum Beacon protocol supports this operation.&lt;/Note&gt;  For some protocols, you can use the &#x60;fee&#x60; property in the request body to specify the maximum fee you are willing to pay. The transaction will fail if the actual fee exceeds the specified maximum fee.  

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
const apiInstance = new CoboWaas2.StakingsApi();
const opts = {
  'CreateClaimActivityRequest': new CoboWaas2.CreateClaimActivityRequest()
};
apiInstance.createClaimActivity(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **CreateClaimActivityRequest** | [**CreateClaimActivityRequest**](CreateClaimActivityRequest.md)| The request body to create a staking request. | [optional] 

### Return type

[**CreateStakeActivity201Response**](CreateStakeActivity201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## createStakeActivity

> CreateStakeActivity201Response createStakeActivity(opts)

Create stake activity

This operation creates a staking request.  For some protocols, you can use the &#x60;fee&#x60; property in the request body to specify the maximum fee you are willing to pay. The transaction will fail if the actual fee exceeds the specified maximum fee.   &lt;Note&gt;For the Babylon protocol, you can only select UTXO as the fee model.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.StakingsApi();
const opts = {
  'CreateStakeActivityRequest': new CoboWaas2.CreateStakeActivityRequest()
};
apiInstance.createStakeActivity(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **CreateStakeActivityRequest** | [**CreateStakeActivityRequest**](CreateStakeActivityRequest.md)| The request body to create a staking request. | [optional] 

### Return type

[**CreateStakeActivity201Response**](CreateStakeActivity201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## createUnstakeActivity

> CreateStakeActivity201Response createUnstakeActivity(opts)

Create unstake activity

This operation creates an unstaking request. Your staked tokens will be automatically unlocked once the specified locking period ends. If you want to withdraw your tokens beforehand, you can unstake them with this operation.  For some protocols, you can use the &#x60;fee&#x60; property in the request body to specify the maximum fee you are willing to pay. The transaction will fail if the actual fee exceeds the specified maximum fee.   &lt;Note&gt;For the Babylon protocol, you can only select UTXO as the fee model.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.StakingsApi();
const opts = {
  'CreateUnstakeActivityRequest': new CoboWaas2.CreateUnstakeActivityRequest()
};
apiInstance.createUnstakeActivity(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **CreateUnstakeActivityRequest** | [**CreateUnstakeActivityRequest**](CreateUnstakeActivityRequest.md)| The request body to create a unstaking request. | [optional] 

### Return type

[**CreateStakeActivity201Response**](CreateStakeActivity201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## createWithdrawActivity

> CreateStakeActivity201Response createWithdrawActivity(opts)

Create withdraw activity

This operation creates a withdrawal request.   For some protocols, you can use the &#x60;fee&#x60; property in the request body to specify the maximum fee you are willing to pay. The transaction will fail if the actual fee exceeds the specified maximum fee.   &lt;Note&gt;For the Babylon protocol, you can only select UTXO as the fee model.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.StakingsApi();
const opts = {
  'CreateWithdrawActivityRequest': new CoboWaas2.CreateWithdrawActivityRequest()
};
apiInstance.createWithdrawActivity(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **CreateWithdrawActivityRequest** | [**CreateWithdrawActivityRequest**](CreateWithdrawActivityRequest.md)| The request body to create a withdraw activity. | [optional] 

### Return type

[**CreateStakeActivity201Response**](CreateStakeActivity201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## getBabylonAirdropRegistrationById

> BabylonAirdropRegistration getBabylonAirdropRegistrationById(registration_id)

Get Babylon airdrop registration details

This operation returns the details of a specific Babylon airdrop registration, including registration status, Bitcoin (BTC) and Babylon addresses, airdrop amount, and error messages (if any).  Please note that registration is an asynchronous process and may take several minutes to complete. It is recommended to call this operation at regular intervals to track the status.  If the registration request fails, please check the error message and resolve the issues before resubmitting the registration request.  For more information, refer to [Babylon&#39;s official doc](https://github.com/babylonlabs-io/babylon/tree/main/docs). 

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
const apiInstance = new CoboWaas2.StakingsApi();
const registration_id = "registration_id_example";
apiInstance.getBabylonAirdropRegistrationById(registration_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **registration_id** | **String**| The Babylon airdrop or Babylon Phase-2 registration ID. You can use the [Register for Babylon airdrop](https://www.cobo.com/developers/v2/api-references/stakings/register-for-babylon-airdrop) or the [Register for Babylon Phase-2](https://www.cobo.com/developers/v2/api-references/stakings/register-for-babylon-phase-2) operation to get this information. | 

### Return type

[**BabylonAirdropRegistration**](BabylonAirdropRegistration.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getBabylonStakingRegistrationById

> BabylonStakingRegistration getBabylonStakingRegistrationById(registration_id)

Get Babylon Phase-2 registration details

This operation returns the details of a specific Babylon Phase-2 registration, including registration status, Bitcoin (BTC) and Babylon addresses, staked amount, and error messages (if any).  Please note that registration is an asynchronous process and may take several minutes to complete. It is recommended to call this operation at regular intervals to track the status.  If the registration request fails, please check the error message and resolve the issues before resubmitting the registration request.  For more information, refer to [Babylon&#39;s official doc](https://github.com/babylonlabs-io/babylon/tree/main/docs). 

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
const apiInstance = new CoboWaas2.StakingsApi();
const registration_id = "registration_id_example";
apiInstance.getBabylonStakingRegistrationById(registration_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **registration_id** | **String**| The Babylon airdrop or Babylon Phase-2 registration ID. You can use the [Register for Babylon airdrop](https://www.cobo.com/developers/v2/api-references/stakings/register-for-babylon-airdrop) or the [Register for Babylon Phase-2](https://www.cobo.com/developers/v2/api-references/stakings/register-for-babylon-phase-2) operation to get this information. | 

### Return type

[**BabylonStakingRegistration**](BabylonStakingRegistration.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getStakingActivityById

> Activity getStakingActivityById(activity_id)

Get staking activity details

This operation retrieves the details of a specified staking activity. 

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
const apiInstance = new CoboWaas2.StakingsApi();
const activity_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.getStakingActivityById(activity_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **activity_id** | **String**| The activity ID. | 

### Return type

[**Activity**](Activity.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getStakingById

> Stakings getStakingById(staking_id)

Get staking position details

This operation retrieves the detailed information about a specified staking position. 

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
const apiInstance = new CoboWaas2.StakingsApi();
const staking_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
apiInstance.getStakingById(staking_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **staking_id** | **String**| The ID of the staking position. You can retrieve a list of staking positions by calling [List staking positions](https://www.cobo.com/developers/v2/api-references/stakings/list-staking-positions). | 

### Return type

[**Stakings**](Stakings.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getStakingEstimationFee

> GetStakingEstimationFee201Response getStakingEstimationFee(opts)

Estimate staking fees

&lt;Note&gt;This operation is deprecated. Please use the [updated version](https://www.cobo.com/developers/v2/api-references/stakings/estimate-staking-fees-v2) instead.&lt;/Note&gt;  This operation calculates the fee required for a staking activity based on factors such as network congestion and transaction complexity.  For some protocols, you can use the &#x60;fee.fee_rate&#x60; property in the request body to specify the fee rate you are willing to pay.  The &#x60;fee.max_fee_amount&#x60; property in the request body will be ignored.  &lt;Note&gt;For the Babylon protocol, you can only select UTXO as the fee model.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.StakingsApi();
const opts = {
  'GetStakingEstimationFeeRequest': new CoboWaas2.GetStakingEstimationFeeRequest()
};
apiInstance.getStakingEstimationFee(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **GetStakingEstimationFeeRequest** | [**GetStakingEstimationFeeRequest**](GetStakingEstimationFeeRequest.md)| The request body to get the estimated fee of a staking activity. | [optional] 

### Return type

[**GetStakingEstimationFee201Response**](GetStakingEstimationFee201Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## getStakingEstimationFeeV2

> EthStakeEstimatedFee getStakingEstimationFeeV2(opts)

Estimate staking fees v2

This operation calculates the fee required for a staking activity based on factors such as network congestion and transaction complexity.  &lt;Note&gt;For the Babylon protocol, you can only select UTXO as the fee model.&lt;/Note&gt; 

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
const apiInstance = new CoboWaas2.StakingsApi();
const opts = {
  'GetStakingEstimationFeeRequest': new CoboWaas2.GetStakingEstimationFeeRequest()
};
apiInstance.getStakingEstimationFeeV2(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **GetStakingEstimationFeeRequest** | [**GetStakingEstimationFeeRequest**](GetStakingEstimationFeeRequest.md)| The request body to get the estimated fee of a staking activity. | [optional] 

### Return type

[**EthStakeEstimatedFee**](EthStakeEstimatedFee.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## getStakingPoolById

> PoolDetails getStakingPoolById(pool_id)

Get staking pool details

This operation retrieves the detailed information about a specified staking pool. 

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
const apiInstance = new CoboWaas2.StakingsApi();
const pool_id = "babylon_btc";
apiInstance.getStakingPoolById(pool_id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **pool_id** | **String**| The ID of the staking pool. A staking pool is a pairing of a staking protocol and a specific type of token. You can call [List staking pools](https://www.cobo.com/developers/v2/api-references/stakings/list-staking-pools) to retrieve a list of staking pools. | 

### Return type

[**PoolDetails**](PoolDetails.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listBabylonAirdropRegistrations

> ListBabylonAirdropRegistrations200Response listBabylonAirdropRegistrations(opts)

List Babylon airdrop registrations

This operation lists all Babylon airdrop registration records within your organization. You can filter the results by request status and Bitcoin (BTC) address.  The registration is processed asynchronously and may take some time to complete. It is recommended to implement automatic monitoring and handle the registration on time.  If the registration request fails, please check the error message and resolve the issues before resubmitting the registration request.  For more information, refer to [Babylon&#39;s official doc](https://github.com/babylonlabs-io/babylon/tree/main/docs). 

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
const apiInstance = new CoboWaas2.StakingsApi();
const opts = {
  'status': "Processing",
  'btc_address': "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listBabylonAirdropRegistrations(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **status** | **String**| The registration request status. | [optional] 
 **btc_address** | **String**| The Bitcoin (BTC) address used for staking. | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListBabylonAirdropRegistrations200Response**](ListBabylonAirdropRegistrations200Response.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listBabylonEligibleAirdrops

> ListBabylonEligibleAirdrops200Response listBabylonEligibleAirdrops(opts)

List wallets eligible for Babylon airdrop

This operation lists all wallets that are eligible for the Babylon airdrop. If an eligible wallet&#39;s status is &#x60;Unregistered&#x60;, you can initiate an airdrop registration for it. You can filter the results by airdrop registration status.  You can use this operation to: - Check which wallets are eligible for airdrop registrations - Estimate airdrop amounts before claiming - Monitor available airdrop  As registration is an asynchronous process and might take some time to complete, it is recommended that you regularly call this operation to check wallet eligibility and register eligible wallets on time.  For more information, refer to [Babylon&#39;s official doc](https://github.com/babylonlabs-io/babylon/tree/main/docs). 

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
const apiInstance = new CoboWaas2.StakingsApi();
const opts = {
  'status': "Registered",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listBabylonEligibleAirdrops(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **status** | **String**| The status of Babylon airdrop or Phase-2 registration. Possible values are: - &#x60;Registered&#x60;: Registered for Babylon airdrop or Phase-2. - &#x60;Unregistered&#x60;: Not registered for any Babylon airdrop or Phase-2. - &#x60;Registering&#x60;: The Babylon airdrop or Phase-2 registration is in progress but not yet completed.  | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListBabylonEligibleAirdrops200Response**](ListBabylonEligibleAirdrops200Response.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listBabylonEligibleStakings

> ListBabylonEligibleStakings200Response listBabylonEligibleStakings(opts)

List staking positions eligible for Babylon Phase-2

This operation lists all staking positions that are eligible for Babylon Phase-2. If an eligible staking position&#39;s status is &#x60;Unregistered&#x60;, you can initiate a registration for it. You can filter the results by registration status.  You can use this operation to: - Check which staking positions can be registered - Get staking details before initiating registration - Monitor available positions for registration  As registration is an asynchronous process and might take some time to complete, it is recommended that you regularly call this operation to check staking position eligibility and register eligible positions on time.  For more information, refer to [Babylon&#39;s official doc](https://github.com/babylonlabs-io/babylon/tree/main/docs). 

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
const apiInstance = new CoboWaas2.StakingsApi();
const opts = {
  'status': "Registered",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listBabylonEligibleStakings(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **status** | **String**| The status of Babylon airdrop or Phase-2 registration. Possible values are: - &#x60;Registered&#x60;: Registered for Babylon airdrop or Phase-2. - &#x60;Unregistered&#x60;: Not registered for any Babylon airdrop or Phase-2. - &#x60;Registering&#x60;: The Babylon airdrop or Phase-2 registration is in progress but not yet completed.  | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListBabylonEligibleStakings200Response**](ListBabylonEligibleStakings200Response.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listBabylonStakingRegistrations

> ListBabylonStakingRegistrations200Response listBabylonStakingRegistrations(opts)

List Babylon Phase-2 registrations

This operation lists all Babylon Phase-2 registration records within your organization. You can filter the results by request status and staking position ID.  The registration is processed asynchronously and may take some time to complete. It is recommended to implement automatic monitoring and handle the registration on time.  If the registration request fails, please check the error message and resolve the issues before resubmitting the registration request.  For more information, refer to [Babylon&#39;s official doc](https://github.com/babylonlabs-io/babylon/tree/main/docs). 

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
const apiInstance = new CoboWaas2.StakingsApi();
const opts = {
  'status': "Processing",
  'staking_id': "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listBabylonStakingRegistrations(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **status** | **String**| The registration request status. | [optional] 
 **staking_id** | **String**| The ID of the Phase-1 BTC staking position. | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListBabylonStakingRegistrations200Response**](ListBabylonStakingRegistrations200Response.md)

### Authorization

[CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listStakingActivities

> ListStakingActivities200Response listStakingActivities(opts)

List staking activities

This operation retrieves a list of staking activities. 

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
const apiInstance = new CoboWaas2.StakingsApi();
const opts = {
  'pool_id': "babylon_btc",
  'staking_id': "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  'activity_type': new CoboWaas2.ActivityType(),
  'activity_status': new CoboWaas2.ActivityStatus(),
  'min_modified_timestamp': 1635744000000,
  'max_modified_timestamp': 1635744000000,
  'initiator': "steve@example.com",
  'request_id': "web_send_by_user_327_1610444045047",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listStakingActivities(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **pool_id** | **String**| The ID of the staking pool. A staking pool is a pairing of a staking protocol and a specific type of token. You can call [List staking pools](https://www.cobo.com/developers/v2/api-references/stakings/list-staking-pools) to retrieve a list of staking pools. | [optional] 
 **staking_id** | **String**| The ID of the Phase-1 BTC staking position. | [optional] 
 **activity_type** | [**ActivityType**](.md)|  | [optional] 
 **activity_status** | [**ActivityStatus**](.md)|  | [optional] 
 **min_modified_timestamp** | **Number**| The start time of the query. All staking activities updated after the specified time will be retrieved. The time is in Unix timestamp format, measured in milliseconds. | [optional] 
 **max_modified_timestamp** | **Number**| The end time of the query. All staking activities updated before the specified time will be retrieved. The time is in Unix timestamp format, measured in milliseconds. | [optional] 
 **initiator** | **String**| The activity initiator, which is your API key by default. You can also specify the initiator when creating the activity. | [optional] 
 **request_id** | **String**| The request ID that is used to track a transaction request. The request ID is provided by you and must be unique within your organization. | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListStakingActivities200Response**](ListStakingActivities200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listStakingPools

> ListStakingPools200Response listStakingPools(opts)

List staking pools

This operation retrieves a list of staking pools currently supported. 

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
const apiInstance = new CoboWaas2.StakingsApi();
const opts = {
  'chain_id': "ETH",
  'token_id': "ETH_USDT",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listStakingPools(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **chain_id** | **String**| The chain ID, which is the unique identifier of a blockchain. You can retrieve the IDs of all the chains you can use by calling [List enabled chains](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-chains). | [optional] 
 **token_id** | **String**| The token ID, which is the unique identifier of a token. You can retrieve the IDs of all the tokens you can use by calling [List enabled tokens](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-tokens). | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListStakingPools200Response**](ListStakingPools200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## listStakings

> ListStakings200Response listStakings(opts)

List staking positions

This operation retrieves a list of staking positions.  

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
const apiInstance = new CoboWaas2.StakingsApi();
const opts = {
  'pool_id': "babylon_btc",
  'statuses': "Active,StakeInProgress,",
  'wallet_id': "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  'token_id': "ETH_USDT",
  'limit': 10,
  'before': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGmk1",
  'after': "RqeEoTkgKG5rpzqYzg2Hd3szmPoj2cE7w5jWwShz3C1vyGSAk"
};
apiInstance.listStakings(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **pool_id** | **String**| The ID of the staking pool. A staking pool is a pairing of a staking protocol and a specific type of token. You can call [List staking pools](https://www.cobo.com/developers/v2/api-references/stakings/list-staking-pools) to retrieve a list of staking pools. | [optional] 
 **statuses** | **String**| The statuses of the staking amounts, separated by comma. Possible values include:  - &#x60;StakeInProgress&#x60;: The staking request is submitted and is waiting to be confirmed by the staking protocol. - &#x60;Active&#x60;: The amount has been staked. - &#x60;Rejected&#x60;: The staking request has been rejected because the signer refuses to sign the transaction. - &#x60;LimitExceeded&#x60;: The total staking cap of the staking protocol has been reached. - &#x60;Invalid&#x60;: The staking request is invalid. This is often due to the failure to broadcast the transaction. - &#x60;UnstakeInProgress&#x60;: The unstaking request is submitted and is waiting to be confirmed by the staking protocol. - &#x60;Withdrawable&#x60;: The tokens have been unstaked and are ready to be withdrawn. - &#x60;WithdrawInProgress&#x60;: The withdrawal request is submitted and is waiting to be confirmed on the chain network. - &#x60;Closed&#x60;: The staking position is closed.  | [optional] 
 **wallet_id** | **String**| The wallet ID. | [optional] 
 **token_id** | **String**| The token ID, which is the unique identifier of a token. You can retrieve the IDs of all the tokens you can use by calling [List enabled tokens](https://www.cobo.com/developers/v2/api-references/wallets/list-enabled-tokens). | [optional] 
 **limit** | **Number**| The maximum number of objects to return. For most operations, the value range is [1, 50]. | [optional] [default to 10]
 **before** | **String**| A cursor indicating the position before the current page. This value is generated by Cobo and returned in the response. If you are paginating forward from the beginning, you do not need to provide it on the first request. When paginating backward (to the previous page), you should pass the before value returned from the last response.  | [optional] 
 **after** | **String**| A cursor indicating the position after the current page. This value is generated by Cobo and returned in the response. You do not need to provide it on the first request. When paginating forward (to the next page), you should pass the after value returned from the last response.  | [optional] 

### Return type

[**ListStakings200Response**](ListStakings200Response.md)

### Authorization

[OAuth2](../README.md#OAuth2), [CoboAuth](../README.md#CoboAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

