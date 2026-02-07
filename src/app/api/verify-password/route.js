import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/encryption';
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const MAX_ATTEMPTS_PER_WINDOW = 5;

// In-memory store for rate limiting (will reset on server restart)
// In production, you might want to use Redis or another persistent store
const rateLimitStore = new Map();

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now - data.timestamp > RATE_LIMIT_WINDOW) {
      rateLimitStore.delete(ip);
    }
  }
}

/**
 * Check if a request is rate limited
 * @param {string} ip - The client IP address
 * @returns {boolean} True if rate limited
 */
function isRateLimited(ip) {
  const now = Date.now();
  
  // Clean up expired entries periodically
  if (Math.random() < 0.1) { // 10% chance to clean up on each request
    cleanupRateLimitStore();
  }
  
  // Get current rate limit data for IP
  const limitData = rateLimitStore.get(ip);
  
  // If no previous attempts or window expired, create new entry
  if (!limitData || now - limitData.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(ip, {
      timestamp: now,
      attempts: 1
    });
    return false;
  }
  
  // Check if too many attempts
  if (limitData.attempts >= MAX_ATTEMPTS_PER_WINDOW) {
    return true;
  }
  
  // Increment attempts
  limitData.attempts += 1;
  return false;
}

export async function POST(request) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limiting
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many password attempts. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Parse request body
    const { slug, password } = await request.json();
    
    if (!slug || !password) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Get post metadata
    const filePath = path.join(process.cwd(), 'content/blog', `${slug}.mdx`);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Read file and extract frontmatter
    const fileContents = await fs.readFile(filePath, 'utf8');
    const { data } = matter(fileContents);
    
    // Check if post is password protected
    if (!data.isProtected) {
      return NextResponse.json(
        { error: 'This post is not password protected' },
        { status: 400 }
      );
    }
    
    // Verify password
    const isValid = verifyPassword(
      password,
      data.passwordHash,
      data.passwordSalt
    );
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }
    
    // Return post decryption data (not the actual content)
    return NextResponse.json({
      success: true,
      decryptionData: {
        iv: data.iv,
        authTag: data.authTag,
        salt: data.passwordSalt
      }
    });
  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json(
      { error: 'Server error during password verification' },
      { status: 500 }
    );
  }
} 