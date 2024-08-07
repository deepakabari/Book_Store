const messageConstant = {
    SUCCESS: "Success",
    ERROR: "Error",
    LOGIN_SUCCESS: "Logged in successfully",
    LOGIN_FAILED: "Username or Password is invalid",
    ACCESS_DENIED: "You have no permission..!",
    ERROR_VERIFY_PERMISSION: "An error occurred while verifying permissions.",
    INTERNAL_SERVER_ERROR: "Internal server error",
    UNIQUE_CONSTRAINT: "Email or phone number already exists.",
    EMAIL_NAME_EXISTS: "Email or business name already exists.",
    USER_NOT_FOUND: "User not found.",
    USER_NOT_EXIST: "User not exist on this email",
    USER_EXIST: "User already exist. Please login!",
    USER_CREATED: "User created successfully",
    USER_UPDATED: "User updated successfully",
    USER_RETRIEVED: "User retrieved successfully",
    USER_DELETED: "User deleted successfully",
    USER_CREATION_FAILED: "User creation failed",
    BOOK_CREATION_FAILED: "Book creation failed",
    BOOK_CREATED: "Book created successfully",
    BOOK_RETRIEVED: "Book retrieved successfully",
    BOOK_UPDATED: "Book updated successfully",
    BOOK_DELETED: "Book deleted successfully",
    BOOK_NOT_FOUND: "Book not found",
    BOOK_ALREADY_EXISTS: "Book with same name already exist. Please choose a different name!",
    NAME_UNIQUE: "Name must be unique. Please choose a different name.",
    BAD_REQUEST: "Bad request",
    VALIDATION_FAILED: "Validation failed",
    EMAIL_IN_USED: "Email already in use",
    FILE_NOT_UPLOADED: "Please Upload the file with valid extension(.png, .jpg, .jpeg)",
    NO_FILE_SELECTED: "File not selected",
    WRONG_PASSWORD: "Wrong password",
    NOT_AUTHORIZED: "Not authorized",
    DELETE_NOT_AUTHORIZED: "You are not authorized to delete this user.",
    RESET_EMAIL_SENT: "Reset email sent successfully",
    RESET_EMAIL_FAILED: "Reset email failed",
    PASSWORD_RESET: "Password reset successfully",
    INVALID_RESET_TOKEN: "Invalid or expired Token",
    EMAIL_NOT_MATCH: "Email and Confirm Email are not the same",
    PASSWORD_NOT_MATCH: "Password and Confirm Password are not the same",
    NOT_GET_HASHED_TOKEN: "Hashed token cannot get, please try again",
    FILE_NOT_FOUND: "File not found",
    ERROR_DOWNLOAD_FILE: "Error when downloading file",
    CATEGORY_EXISTS: "Category already exists.",
    CATEGORY_CREATION_FAILED: "Category creation failed",
    CATEGORY_CREATED: "Category created successfully.",
    CATEGORY_NOT_EXISTS: "Category not exists.",
    CATEGORY_UPDATED: "Category updated successfully.",
    CATEGORY_NAME_UNIQUE: "The Category name must be unique. Please choose a different name.",
    CATEGORY_HAS_BOOKS: "Category has books.",
    CATEGORY_DELETED: "Category deleted successfully",
    CATEGORY_RETRIEVED: "Category retrieved successfully",
    BOOK_IN_CART: "Book already added in cart",
    BOOK_ADDED_IN_CART: "Book successfully added in cart.",
    CART_RETRIEVED: "Cart retrieved successfully.",
    CART_UPDATED: "Cart updated successfully.",
    CART_NOT_FOUND: "Cart not found",
    CART_DELETED: "Cart deleted successfully.",
    CART_QUANTITY_UPDATED: "Cart quantity updated",
    CART_EMPTY: "Cart is empty or already placed",
    ORDER_CREATED: "Order created successfully",
    QUANTITY_NOT_AVAILABLE: "Insufficient quantity in inventory",
    CARD_HOLDER_FAILED: "Card holder creation failed",
    CARD_NOT_ISSUED: "Card is not issued by stripe",
    CARD_HOLDER_ALREADY_EXISTS: "Card holder already exists",
    CARD_HOLDER_SAVED: "Card holder created successfully",
    CARD_SAVED: "Card saved successfully",
    CARD_ACTIVATED: "Card activated successfully",
    CARD_NOT_ACTIVATED: "Error in card activation",
    CARD_CREATION_FAILED: "Card creation failed",
    CARD_ATTACHED: "Card attached successfully",
    NO_CARDS_FOUND: "No cards found",
    CARDS_RETRIEVED: "Cards retrieved successfully.",
    PAYMENT_METHOD_CREATED: "Payment method created",
    PAYMENT_METHOD_RETRIEVED: "Payment method retrieved successfully.",
    PAYMENT_METHOD_NOT_FOUND: "Payment method not found",
    PAYMENT_METHOD_FAILED: "Payment method creation failed",
    PAYMENT_METHOD_ATTACHED: "Payment method attached successfully!",
    AUTHORIZED_SUCCESS: "Authorization successful",
    AUTHORIZED_FAILED: "Authorization failed",
    CUSTOMER_CREATE: "Customer created successfully",
    CUSTOMER_EXISTS: "Customer already exists in stripe",
    STRIPE_CUSTOMER_NOT_EXISTS: "User does not have a stripe customer ID, please create customer on stripe.",
    SETUP_INTENT_FAILED: "Setup Intent was not found.",
    SESSION_URL_MISSING: "Stripe Checkout session URL is missing.",
    SESSION_FAILED: "Session retrieval failed",
    SESSION_CREATED: "Session created successfully.",
    UNABLE_PAYMENT_INTENT_ID: "Unable to retrieve payment intent ID",
    USER_PLAN_NOT_FOUND: "User or Plan not found",
    SUBSCRIPTION_CREATED: "Subscription created successfully.",
    SUBSCRIPTION_NOT_FOUND: "Subscription not found.",
    SUBSCRIPTION_CHANGED: "Subscription changed successfully.",
    SUBSCRIPTION_RETRIEVED: "Subscription retrieved successfully",
    SUBSCRIPTION_SCHEDULED: "Subscription scheduled successfully",
    SUBSCRIPTION_CANCELED: "Subscription canceled successfully",
    SUBSCRIPTION_PAUSED: "Subscription paused successfully.",
    SUBSCRIPTION_RESUMED: "Subscription resumed successfully",
    PLAN_CREATED: "Plan created successfully.",
    PLAN_EXISTS: "Plan already exists with same name.",
    PLAN_NOT_FOUND: "Plan not found, please create one.",
    PLAN_RETRIEVED: "Plan retrieved successfully",
    SUBSCRIPTION_ALREADY_EXISTS: "Subscription already exists.",
    TEST_CLOCK_CREATED: "Test clock created successfully",
    TAX_RATE_CREATED: "Tax rate created successfully.",
    TAX_RATE_NOT_FOUND: "Tax rate not found.",
    TAX_RATE_RETRIEVED: "Tax rate retrieved successfully.",
    TAX_RATE_EXISTS: "Tax rate already exists.",
    DISCOUNT_EXISTS: "Discount code already exists.",
    DISCOUNT_CREATED: "Discount created successfully",
    INVALID_COUPON_CODE: "Invalid or inactive discount code.",
};

export default messageConstant;
