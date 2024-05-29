export {};
declare global {
    namespace Express {
        interface Request {
            user: {
                id: number;
                email: string;
                firstName: string;
                lastName: string;
                phoneNumber: string;
                roleId: number
            };
        }
    }
}
