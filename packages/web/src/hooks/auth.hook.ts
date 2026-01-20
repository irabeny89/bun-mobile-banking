import { ACCESS_TOKEN_KEY } from "@/config";
import { eden } from "@/lib/api";
import { decodeJwt } from "@/lib/utils";
import type { ApiErrorT, ApiSuccessT, TokenPayloadT } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";


export const registerBodySchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	mfaEnabled: z.boolean()
});
export type RegisterBodyT = z.infer<typeof registerBodySchema>;
type RegisterResponseData = {
	message: string;
	nextStep: string;
}
export const registerCompleteSchema = z.object({
	otp: z.string().min(6).max(6)
})
export type RegisterCompleteBodyT = z.infer<typeof registerCompleteSchema>;
type RegisterCompleteResponseData = {
	accessToken: string;
	refreshToken: string;
	message: string;
}

export function useAuth() {
	const [user, setUser] = useState<TokenPayloadT | null>(null);
	useEffect(() => {
		const accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
		if (accessToken) {
			try {
				setUser(decodeJwt<TokenPayloadT>(accessToken));
			} catch (e) {
				console.error("Failed to decode token", e);
			}
		}
	}, []);
	return user
}

export function useRegister() {
	const register = useMutation({
		mutationKey: ["register"],
		mutationFn: async (body: RegisterBodyT) => {
			try {
				const res = await eden.api.v1.auth.register.individual.post(body);
				const { type } = res.data as ApiSuccessT | ApiErrorT
				if (type === "error") {
					const { error } = res.data as ApiErrorT
					throw new Error(error.message)
				}
				return res.data as ApiSuccessT<RegisterResponseData>
			} catch (error) {
				throw new Error("Something went wrong")
			}
		}
	});
	return register;
}

export function useRegisterComplete() {
	const completeRegister = useMutation({
		mutationKey: ["complete-register"],
		mutationFn: async (body: RegisterCompleteBodyT) => {
			try {
				const res = await eden.api.v1.auth.register.individual.complete.post(body);
				const { type } = res.data as ApiSuccessT | ApiErrorT
				if (type === "error") {
					const { error } = res.data as ApiErrorT
					throw new Error(error.message)
				}
				return res.data as ApiSuccessT<RegisterCompleteResponseData>
			} catch (error) {
				throw new Error("Something went wrong")
			}
		}
	});
	return completeRegister;
}