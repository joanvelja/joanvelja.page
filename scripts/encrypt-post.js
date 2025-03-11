#!/usr/bin/env node

/**
 * Utility script to encrypt a blog post
 * 
 * Usage:
 * node scripts/encrypt-post.js <slug> [password]
 * 
 * Example:
 * node scripts/encrypt-post.js my-private-diary-entry mysecretpassword
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const crypto = require('crypto');
const readline = require('readline');

// Set up constants for encryption (must match src/lib/encryption.js)
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const PBKDF2_ITERATIONS = 100000;
const SALT_BYTES = 16;
const IV_BYTES = 16;
const KEY_LENGTH = 32; // 256 bits

// Hash a password using PBKDF2
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

// Encrypt content using AES-256-GCM
function encryptContent(content, password, salt) {
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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Main function
async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Error: Missing slug argument');
    console.log('Usage: node scripts/encrypt-post.js <slug> [password]');
    process.exit(1);
  }
  
  const slug = args[0];
  let password = args[1];
  
  // Prompt for password if not provided
  if (!password) {
    password = await new Promise(resolve => {
      rl.question('Enter password for encryption: ', answer => {
        resolve(answer);
      });
    });
  }
  
  if (!password || password.length < 8) {
    console.error('Error: Password must be at least 8 characters long');
    process.exit(1);
  }
  
  // Get post file path
  const filePath = path.join(process.cwd(), 'content/blog', `${slug}.mdx`);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`Error: Post file not found: ${filePath}`);
    process.exit(1);
  }
  
  // Read file
  const fileContents = fs.readFileSync(filePath, 'utf8');
  
  // Parse frontmatter
  const { data, content } = matter(fileContents);
  
  // Check if already protected
  if (data.isProtected) {
    const confirm = await new Promise(resolve => {
      rl.question('This post is already protected. Re-encrypt? (y/n): ', answer => {
        resolve(answer.toLowerCase() === 'y');
      });
    });
    
    if (!confirm) {
      console.log('Operation cancelled');
      rl.close();
      process.exit(0);
    }
  }
  
  // Generate password hash and salt
  const { hash, salt } = hashPassword(password);
  
  // Encrypt content
  const { encryptedContent, iv, authTag } = encryptContent(content, password, salt);
  
  // Calculate estimated reading time
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/g).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  // Update frontmatter
  const updatedData = {
    ...data,
    isProtected: true,
    passwordHash: hash,
    passwordSalt: salt,
    iv,
    authTag,
    encryptedContent,
    estimatedReadingTime: readingTime,
  };
  
  // Create excerpt if not present
  if (!updatedData.excerpt) {
    updatedData.excerpt = 'This post is password protected.';
  }
  
  // Create new file content with updated frontmatter
  // We don't include the original content since it's now encrypted
  const updatedFileContent = matter.stringify('', updatedData);
  
  // Write updated file
  fs.writeFileSync(filePath, updatedFileContent);
  
  console.log(`✅ Successfully encrypted post: ${slug}`);
  console.log(`📝 Password hash and encrypted content stored in frontmatter`);
  console.log(`🔑 Keep your password safe: ${password}`);
  console.log(`⚠️  WARNING: Do not commit this password to version control!`);
  
  rl.close();
}

// Run main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 