import crypto from 'crypto';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const PBKDF2_ITERATIONS = 100000;
const SALT_BYTES = 16;
const KEY_LENGTH = 32;

function hashPassword(password, providedSalt = null) {
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

export function verifyPassword(password, storedHash, storedSalt) {
  const salt = Buffer.from(storedSalt, 'base64');
  const { hash } = hashPassword(password, salt);
  
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(storedHash)
  );
}

export function decryptContent(encryptedContent, password, salt, iv, authTag) {
  const saltBuffer = Buffer.from(salt, 'base64');
  const ivBuffer = Buffer.from(iv, 'base64');
  const authTagBuffer = Buffer.from(authTag, 'base64');
  const key = crypto.pbkdf2Sync(
    password,
    saltBuffer,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    'sha256'
  );
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, ivBuffer);
  decipher.setAuthTag(authTagBuffer);

  try {
    let decrypted = decipher.update(encryptedContent, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    throw new Error('Decryption failed: Invalid password or corrupted data');
  }
} 
