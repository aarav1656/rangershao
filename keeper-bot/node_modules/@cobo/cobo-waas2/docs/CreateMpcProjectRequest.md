# CoboWaas2.CreateMpcProjectRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **String** | The project name. | 
**participants** | **Number** | The number of key share holders in the project.  **Notes:** 1. Currently, the available [Threshold Signature Schemes (TSS)](https://manuals.cobo.com/en/portal/mpc-wallets/introduction#threshold-signature-scheme-tss) are 2-2, 2-3, and 3-3 schemes (in the \&quot;threshold - participants\&quot; format), so you can only set &#x60;participants&#x60; to 2 or 3.   2. &#x60;threshold&#x60; must be less than or equal to &#x60;participants&#x60;.  | 
**threshold** | **Number** | The number of key share holders required to sign an operation in the project.  **Notes:** 1. Currently, the available [Threshold Signature Schemes (TSS)](https://manuals.cobo.com/en/portal/mpc-wallets/introduction#threshold-signature-scheme-tss) are 2-2, 2-3, and 3-3 schemes (in the \&quot;threshold - participants\&quot; format), so you can only set &#x60;threshold&#x60; to 2 or 3.   2. &#x60;threshold&#x60; must be less than or equal to &#x60;participants&#x60;.  | 


