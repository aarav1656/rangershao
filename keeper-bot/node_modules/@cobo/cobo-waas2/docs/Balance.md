# CoboWaas2.Balance

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**total** | **String** | The current amount of tokens in an address, which is retrieved directly from the network. To learn more, see [Balances and transaction amounts for MPC Wallets](https://www.cobo.com/developers/v2/guides/mpc-wallets/balance-amounts) for more details. | 
**available** | **String** | The amount of tokens ready to be spent. To learn more, see [Balances and transaction amounts for MPC Wallets](https://www.cobo.com/developers/v2/guides/mpc-wallets/balance-amounts) for more details. | 
**pending** | **String** | The total amount being sent in a transaction, which is calculated as the withdrawal amount plus the transaction fee. To learn more, see [Balances and transaction amounts for MPC Wallets](https://www.cobo.com/developers/v2/guides/mpc-wallets/balance-amounts) for more details. | [optional] [default to &#39;0&#39;]
**locked** | **String** | For UTXO chains, this is the combined value of the selected UTXOs for the transaction. For other chains, it is equal to the Pending amount. To learn more, see [Balances and transaction amounts for MPC Wallets](https://www.cobo.com/developers/v2/guides/mpc-wallets/balance-amounts) for more details. | [optional] [default to &#39;0&#39;]
**frozen** | **String** | Amount frozen due to compliance inspection. To learn more, see [Balances and transaction amounts for MPC Wallets](https://www.cobo.com/developers/v2/guides/mpc-wallets/balance-amounts) for more details. | [optional] [default to &#39;0&#39;]


