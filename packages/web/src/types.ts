export const AuthTabs = {
    LOGIN: "login",
    REGISTER: "register",
    RECOVERY: "recovery"
} as const;

export type AuthTabsT = (typeof AuthTabs)[keyof typeof AuthTabs];
