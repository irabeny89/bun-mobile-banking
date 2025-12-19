import crypto from 'node:crypto';
import { SECRET_1 } from '../config';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
// Ensure key is 32 bytes. using scrypt to derive a key from the secret
// salt is empty or fixed because we want deterministic key from the same secret env
const KEY = crypto.scryptSync(SECRET_1, 'salt', 32);

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

export function decrypt(text: string): string {
    const [ivHex, encryptedHex] = text.split(':');
    if (!ivHex || !encryptedHex) {
        throw new Error('Invalid encrypted text format');
    }
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
