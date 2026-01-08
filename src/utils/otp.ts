/**
 * Generates numeric OTP(one-time password) string.
 * @param digits number of digits to generate. Default is 6, min is 2 & max is 8.
 * @returns numeric OTP string
 */
export async function genOTP(digits: 2 | 3 | 4 | 5 | 6 | 7 | 8 = 6): Promise<string> {
    if (digits < 2 || digits > 8) {
        throw new Error("Invalid number of digits");
    }
    return Date.now()
        .toString(10)
        .slice(-digits);
}
