import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/encryption';
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_ATTEMPTS_PER_WINDOW = 5;

const rateLimitStore = new Map();

function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now - data.timestamp > RATE_LIMIT_WINDOW) {
      rateLimitStore.delete(ip);
    }
  }
}

function isRateLimited(ip) {
  const now = Date.now();

  if (Math.random() < 0.1) {
    cleanupRateLimitStore();
  }
  
  const limitData = rateLimitStore.get(ip);

  if (!limitData || now - limitData.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(ip, {
      timestamp: now,
      attempts: 1
    });
    return false;
  }
  
  if (limitData.attempts >= MAX_ATTEMPTS_PER_WINDOW) {
    return true;
  }
  
  limitData.attempts += 1;
  return false;
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many password attempts. Please try again later.' },
        { status: 429 }
      );
    }
    
    const { slug, password } = await request.json();
    
    if (!slug || !password) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    const filePath = path.join(process.cwd(), 'content/blog', `${slug}.mdx`);

    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    const fileContents = await fs.readFile(filePath, 'utf8');
    const { data } = matter(fileContents);
    
    if (!data.isProtected) {
      return NextResponse.json(
        { error: 'This post is not password protected' },
        { status: 400 }
      );
    }
    
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