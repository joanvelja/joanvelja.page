// Encryption and password protection utilities
import crypto from 'crypto';

// Set up constants for encryption
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const PBKDF2_ITERATIONS = 100000; // High number of iterations for key derivation
const SALT_BYTES = 16;
const IV_BYTES = 16;
const KEY_LENGTH = 32; // 256 bits
const AUTH_TAG_BYTES = 16;

/**
 * Hash a password using PBKDF2
 * @param {string} password - The password to hash
 * @param {Buffer} salt - Optional salt, will generate if not provided
 * @returns {Object} Object containing hash and salt
 */
export function hashPassword(password, providedSalt = null) {
  const salt = providedSalt || crypto.randomBytes(SALT_BYTES);
  
  const hash = crypto.pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    'sha256'
  );
  
  return {
    hash: hash.toString('base64'),
    salt: salt.toString('base64')
  };
}

/**
 * Verify a password against a stored hash
 * @param {string} password - The password to verify
 * @param {string} storedHash - The stored hash (base64)
 * @param {string} storedSalt - The stored salt (base64)
 * @returns {boolean} True if password matches
 */
export function verifyPassword(password, storedHash, storedSalt) {
  const salt = Buffer.from(storedSalt, 'base64');
  const { hash } = hashPassword(password, salt);
  
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(storedHash)
  );
}

/**
 * Encrypt content using AES-256-GCM
 * @param {string} content - Content to encrypt
 * @param {string} password - Password to derive key from
 * @param {string} salt - Salt for key derivation (base64)
 * @returns {Object} Encrypted content data
 */
export function encryptContent(content, password, salt) {
  // Convert salt from base64
  const saltBuffer = Buffer.from(salt, 'base64');
  
  // Generate random IV
  const iv = crypto.randomBytes(IV_BYTES);
  
  // Derive key from password
  const key = crypto.pbkdf2Sync(
    password, 
    saltBuffer,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    'sha256'
  );
  
  // Create cipher
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  
  // Encrypt content
  let encrypted = cipher.update(content, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // Get auth tag
  const authTag = cipher.getAuthTag();
  
  return {
    encryptedContent: encrypted,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64')
  };
}

/**
 * Decrypt content using AES-256-GCM
 * @param {string} encryptedContent - Encrypted content (base64)
 * @param {string} password - Password to derive key from
 * @param {string} salt - Salt used for key derivation (base64)
 * @param {string} iv - Initialization vector used for encryption (base64)
 * @param {string} authTag - Authentication tag (base64)
 * @returns {string} Decrypted content
 */
export function decryptContent(encryptedContent, password, salt, iv, authTag) {
  // Convert from base64
  const saltBuffer = Buffer.from(salt, 'base64');
  const ivBuffer = Buffer.from(iv, 'base64');
  const authTagBuffer = Buffer.from(authTag, 'base64');
  
  // Derive key from password
  const key = crypto.pbkdf2Sync(
    password,
    saltBuffer,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    'sha256'
  );
  
  // Create decipher
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, ivBuffer);
  decipher.setAuthTag(authTagBuffer);
  
  try {
    // Decrypt content
    let decrypted = decipher.update(encryptedContent, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    // Invalid password or tampered data
    throw new Error('Decryption failed: Invalid password or corrupted data');
  }
} 