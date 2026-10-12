def humanize_feature(
    feature_name: str
) -> str:

    if "amount" in feature_name:

        return (
            "Transaction Amount"
        )


    if "TRANSFER" in feature_name:

        return (
            "Transfer Transaction"
        )


    if "PAYMENT" in feature_name:

        return (
            "Payment Transaction"
        )


    if "CASH_OUT" in feature_name:

        return (
            "Withdrawal Transaction"
        )


    if "CASH_IN" in feature_name:

        return (
            "Deposit Transaction"
        )


    if "DEBIT" in feature_name:

        return (
            "Debit Transaction"
        )


    return (
        feature_name
        .replace(
            "transaction_type__",
            ""
        )
        .replace(
            "type_",
            ""
        )
        .replace(
            "_",
            " "
        )
        .title()
    )