/// Service handle business logic, decoupled from Elysia controller
import { AuthModel } from "./model";

export abstract class AuthService {
    static async register(sql: Bun.SQL, body: AuthModel.RegisterT): Promise<AuthModel.TokenT> {
        if (body.userType === "individual") {
            const res: Record<"id", string>[] = await sql`
                INSERT INTO users (user_type, first_name, middle_name, last_name, email, phone, password, address)
                VALUES (${body.userType}, ${body.firstName}, ${body.middleName}, ${body.lastName}, ${body.email}, ${body.phone}, ${body.password}, ${body.address})
                RETURNING id
            `
            const userId = res[0].id;
            return {
                accessToken: "",
                refreshToken: "",
            };
        } else if (body.userType === "business") {
            return true;
        } else {
            return false;
        }
    }
    static async verify(body: AuthModel.VerifyT): Promise<boolean> {
        return true;
    }
    static async login(body: AuthModel.LoginT): Promise<boolean> {
        return true;
    }
    static async refreshToken(body: AuthModel.RefreshTokenT): Promise<boolean> {
        return true;
    }
    static async forgotPassword(body: AuthModel.ForgotPasswordT): Promise<boolean> {
        return true;
    }
    static async resetPassword(body: AuthModel.ResetPasswordT): Promise<boolean> {
        return true;
    }
    static async logout(body: AuthModel.LogoutT): Promise<boolean> {
        return true;
    }
}