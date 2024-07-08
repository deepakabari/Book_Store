const linkConstant = {
    PASSWORD_REGEX: "^(?=.*[!@#$%^&*(),.?:{}|<>])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,16}$",
    RESET_URL: "http://localhost:3000/auth/resetPassword/",
    BOOK_URL: "http://localhost:4000/book/book",
    SUCCESS: "http://localhost:4000/card/success",
    CANCEL: "http://localhost:4000/card/cancel",
    PAYMENT_FORM: "http://localhost:4000/payment/payment-form",
    CREATE_PAYMENT_FORM: "http://localhost:4000/payment/createPaymentMethod",
    EXPORT_BOOK: "http://localhost:4000/book/getAllBooks",
};

export default linkConstant;
