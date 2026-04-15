# CoboWaas2.TransactionDestination

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**destination_type** | [**TransactionDestinationType**](TransactionDestinationType.md) |  | 
**account_output** | [**TransactionTransferToAddressDestinationAccountOutput**](TransactionTransferToAddressDestinationAccountOutput.md) |  | [optional] 
**utxo_outputs** | [**[TransactionTransferToAddressDestinationUtxoOutputsInner]**](TransactionTransferToAddressDestinationUtxoOutputsInner.md) |  | [optional] 
**change_address** | **String** | The address used to receive the remaining funds or change from the transaction. | [optional] 
**force_internal** | **Boolean** | Whether the transaction request must be executed as a [Cobo Loop](https://manuals.cobo.com/en/portal/custodial-wallets/cobo-loop) transfer.   - &#x60;true&#x60;: The transaction request must be executed as a Cobo Loop transfer.   - &#x60;false&#x60;: The transaction request may not be executed as a Cobo Loop transfer.  If both &#x60;force_internal&#x60; and &#x60;force_external&#x60; are set to &#x60;false&#x60;, the system uses Cobo Loop by default if possible; otherwise, it proceeds with an on-chain transfer.  | [optional] 
**force_external** | **Boolean** | Whether the transaction request must not be executed as a [Cobo Loop](https://manuals.cobo.com/en/portal/custodial-wallets/cobo-loop) transfer.   - &#x60;true&#x60;: The transaction request must not be executed as a Cobo Loop transfer.   - &#x60;false&#x60;: The transaction request can be executed as a Cobo Loop transfer.  If both &#x60;force_internal&#x60; and &#x60;force_external&#x60; are set to &#x60;false&#x60;, the system uses Cobo Loop by default if possible; otherwise, it proceeds with an on-chain transfer.  | [optional] 
**wallet_id** | **String** | The wallet ID. | 
**trading_account_type** | **String** | The trading account type. | [optional] 
**exchange_id** | [**ExchangeId**](ExchangeId.md) |  | [optional] 
**amount** | **String** | The transfer amount. For example, if you trade 1.5 BTC, then the value is &#x60;1.5&#x60;.  | 
**address** | **String** | The destination address. | 
**value** | **String** | The transfer amount. For example, if you trade 1.5 TRX, then the value is &#x60;1.5&#x60;.  | [optional] 
**calldata** | **String** | The data that is used to invoke a specific function or method within the specified contract at the destination address.  | 
**calldata_info** | [**TransactionEvmCalldataInfo**](TransactionEvmCalldataInfo.md) |  | [optional] 
**instructions** | [**[TransactionSolContractInstruction]**](TransactionSolContractInstruction.md) |  | [optional] 
**address_lookup_table_accounts** | [**[TransactionSolContractAddressLookupTableAccount]**](TransactionSolContractAddressLookupTableAccount.md) |  | [optional] 
**cosmos_messages** | [**[TransactionCosmosMessage]**](TransactionCosmosMessage.md) |  | 
**message** | **String** | The raw data of the message to be signed, encoded in Base64 format. | 
**raw_structured_data** | **String** | The raw structured data to be signed, formatted as a JSON string. | [optional] 
**structured_data** | **{String: Object}** | The structured data to be signed, formatted as a JSON object according to the EIP-712 standard. | 
**safe_tx_extra_data** | [**SafeTxExtraData**](SafeTxExtraData.md) |  | [optional] 
**msg_hash** | **String** | Message hash to be signed, in hexadecimal format. | [optional] 
**wallet_type** | [**WalletType**](WalletType.md) |  | 
**wallet_subtype** | [**WalletSubtype**](WalletSubtype.md) |  | 
**memo** | **String** | The memo that identifies a transaction in order to credit the correct account. For transfers out of Cobo Portal, it is highly recommended to include a memo for the chains such as XRP, EOS, XLM, IOST, BNB_BNB, ATOM, LUNA, and TON. | [optional] 
**tx_info** | [**TransactionDepositToAddressDestinationTxInfo**](TransactionDepositToAddressDestinationTxInfo.md) |  | [optional] 
**message_bip137** | **String** | Message to be signed, in hexadecimal format. | 
**message_bip322** | **String** | Message to be signed, in hexadecimal format. | 
**message_cosmos_adr36** | **String** | Message to be signed, in hexadecimal format. | 
**contract_param** | [**TransactionStellarContractParam**](TransactionStellarContractParam.md) |  | 


