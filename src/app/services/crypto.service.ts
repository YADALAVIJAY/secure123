import { Injectable } from '@angular/core';
import * as forge from 'node-forge';

@Injectable({
    providedIn: 'root'
})
export class CryptoService {

    constructor() { }

    // -------------------------
    // 1. AES Operations
    // -------------------------

    /**
     * Generates a random 32-byte (256-bit) AES key.
     * key is returned as a binary string (or bytes).
     */
    generateAESKey(): string {
        return forge.random.getBytesSync(32);
    }

    /**
     * Encrypts file content using AES-CBC.
     * Returns: { encryptedBytes: string (binary), iv: string (binary) }
     * We prepend IV to the encrypted content for simpler storage.
     */
    encryptFile(fileContent: ArrayBuffer, aesKey: string): string {
        const iv = forge.random.getBytesSync(16);
        const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
        cipher.start({ iv: iv });

        // Convert ArrayBuffer to binary string for Forge
        const fileStr = this.arrayBufferToBinaryString(fileContent);
        cipher.update(forge.util.createBuffer(fileStr));
        cipher.finish();

        const encrypted = cipher.output.getBytes();

        // Return IV + EncryptedContent
        return iv + encrypted;
    }

    /**
     * Decrypts file content using AES-CBC.
     * Input: Binary string (IV + Encrypted)
     * Output: ArrayBuffer
     */
    decryptFile(encryptedDataWithIv: string, aesKey: string): ArrayBuffer {
        const iv = encryptedDataWithIv.slice(0, 16);
        const encrypted = encryptedDataWithIv.slice(16);

        const decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
        decipher.start({ iv: iv });
        decipher.update(forge.util.createBuffer(encrypted));
        const result = decipher.finish();

        if (!result) {
            throw new Error('Decryption failed');
        }

        return this.binaryStringToArrayBuffer(decipher.output.getBytes());
    }

    // -------------------------
    // 2. RSA Operations (Key Encryption)
    // -------------------------

    /**
     * Encrypts the AES key using the Receiver's Public Key.
     * Returns Base64 encoded string.
     */
    encryptAESKey(aesKey: string, receiverPublicKey: string): string {
        const pem = this.ensurePem(receiverPublicKey, 'PUBLIC');
        const publicKey = forge.pki.publicKeyFromPem(pem);
        const encrypted = publicKey.encrypt(aesKey, 'RSA-OAEP');
        return forge.util.encode64(encrypted);
    }

    /**
     * Decrypts the Encrypted AES Key using Receiver's Private Key.
     * Input: Base64 encoded encrypted key.
     * Output: Binary string (the AES key).
     */
    decryptAESKey(encryptedAesKeyBase64: string, receiverPrivateKey: string): string {
        try {
            const pem = this.ensurePem(receiverPrivateKey, 'PRIVATE');
            const privateKey = forge.pki.privateKeyFromPem(pem);
            const encryptedBytes = forge.util.decode64(encryptedAesKeyBase64);

            try {
                // Try OAEP first (New backend standard)
                return privateKey.decrypt(encryptedBytes, 'RSA-OAEP');
            } catch (oaepError) {
                console.warn('OAEP Decryption failed, attempting PKCS1 fallback...', oaepError);
                // Fallback to PKCS1 (Old backend standard / Legacy files)
                return privateKey.decrypt(encryptedBytes, 'RSAES-PKCS1-V1_5');
            }
        } catch (e) {
            console.error("AES Key Decryption Failed", e);
            throw e;
        }
    }

    private ensurePem(key: string, type: 'PUBLIC' | 'PRIVATE'): string {
        if (!key) return '';
        if (key.includes('-----BEGIN')) return key;

        const header = `-----BEGIN ${type} KEY-----`;
        const footer = `-----END ${type} KEY-----`;
        return `${header}\n${key}\n${footer}`;
    }

    // -------------------------
    // 3. Digital Signature
    // -------------------------

    /**
     * Signs the Original File Content (or its hash) using Sender's Private Key.
     * We will hash the file content first (SHA-256), then sign the hash.
     * Returns Base64 encoded signature.
     */
    /**
     * Signs the Original File Content (or its hash) using Sender's Private Key.
     * We will hash the file content first (SHA-256), then sign the hash.
     * Returns Base64 encoded signature.
     */
    signData(fileContent: ArrayBuffer, senderPrivateKey: string): string {
        try {
            const md = forge.md.sha256.create();
            const fileStr = this.arrayBufferToBinaryString(fileContent);
            md.update(fileStr, 'raw');

            const pem = this.ensurePem(senderPrivateKey, 'PRIVATE');
            const privateKey = forge.pki.privateKeyFromPem(pem);
            const signature = privateKey.sign(md);

            return forge.util.encode64(signature);
        } catch (e) {
            console.error("Signing Failed", e);
            throw e;
        }
    }

    /**
     * Verifies the signature using Sender's Public Key.
     */
    verifySignature(fileContent: ArrayBuffer, signatureBase64: string, senderPublicKey: string): boolean {
        try {
            const md = forge.md.sha256.create();
            const fileStr = this.arrayBufferToBinaryString(fileContent);
            md.update(fileStr, 'raw');

            const signature = forge.util.decode64(signatureBase64);
            const pem = this.ensurePem(senderPublicKey, 'PUBLIC');
            const publicKey = forge.pki.publicKeyFromPem(pem);

            return publicKey.verify(md.digest().bytes(), signature);
        } catch (e) {
            console.error("Verification Failed", e);
            return false;
        }
    }

    // -------------------------
    // 4. Utils
    // -------------------------

    arrayBufferToBinaryString(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return binary;
    }

    binaryStringToArrayBuffer(binary: string): ArrayBuffer {
        const length = binary.length;
        const buffer = new ArrayBuffer(length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < length; i++) {
            view[i] = binary.charCodeAt(i);
        }
        return buffer;
    }

    /**
     * Converts a binary string to a Hex string.
     * Useful for displaying keys safely.
     */
    bytesToHex(bytes: string): string {
        return forge.util.bytesToHex(bytes);
    }

    /**
     * Converts a Hex string back to a binary string.
     * Useful for retrieving keys from input.
     */
    hexToBytes(hex: string): string {
        return forge.util.hexToBytes(hex);
    }

    blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result as ArrayBuffer);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
        });
    }
}
