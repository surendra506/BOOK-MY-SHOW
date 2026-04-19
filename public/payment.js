export const paymentConfig = {
    // You can change your upiId here
    upiId: "YourUPIid@okicici", 
    
    // You can also apply a static price here if needed, 
    // or keep it null to use the dynamically computed ticket total
    fixedPrice: null, 

    payeeName: "flipkart",
    merchantCode: "8999",
    transactionNote: "CUST2141782633",
    sign: "AAuN7izDWN5cb8A5scnUiNME+LkZqI2DWgkXlN1McoP6WZABa/KkFTiLvuPRP6/nWK8BPg/rPhb+u4QMrUEX10UsANTDbJaALcSM9b8Wk218X+55T/zOzb7xoiB+BcX8yYuYayELImXJHIgL/c7nkAnHrwUCmbM97nRbCVVRvU0ku3Tr"
};

export function getPaymentLink(amount) {
    const finalAmount = paymentConfig.fixedPrice !== null ? paymentConfig.fixedPrice : amount;
    return `phonepe://pay?pa=${paymentConfig.upiId}&am=${finalAmount}&pn=${paymentConfig.payeeName}&mc=${paymentConfig.merchantCode}&cu=INR&tn=${paymentConfig.transactionNote}&sign=${paymentConfig.sign}`;
}
