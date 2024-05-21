const linkConstant = {
    PASSWORD_REGEX:
        '^(?=.*[!@#$%^&*(),.?:{}|<>])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,16}$',
    RESET_URL: 'http://localhost:3000/auth/resetPassword/',
};

export default linkConstant;
