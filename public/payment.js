export const paymentConfig = {
    upiId: "7225062373@ibl", 
    fixedPrice: 1, 
    payeeName: "Anuj",
    transactionNote: "TestPayment"
};

export function getPaymentLink(amount) {
    const finalAmount = paymentConfig.fixedPrice !== null ? paymentConfig.fixedPrice : amount;
    
    // As per your new format: phonepe://pay?pa=7225062373@ibl&pn=Anuj&am=1&cu=INR&tn=TestPayment
    return `phonepe://pay?pa=${paymentConfig.upiId}&pn=${paymentConfig.payeeName}&am=${finalAmount}&cu=INR&tn=${paymentConfig.transactionNote}`;
}
