export const AuthTabs = {
    LOGIN: "login",
    REGISTER: "register",
    RECOVERY: "recovery"
} as const;

export type AuthTabsT = (typeof AuthTabs)[keyof typeof AuthTabs];

export type ApiSuccessT<T = null> = {
    type: "success";
    data: T
}

export type ApiErrorT = {
    type: "error"
    error: {
        message: string;
        code: string | number;
        details: {
            message: string;
            path: string;
            value: string;
        }[];
    };
}

export type TokenPayloadT = {
    id: string;
    userType: "unknown" | "individual" | "business" | "mono";
    email: string;
}