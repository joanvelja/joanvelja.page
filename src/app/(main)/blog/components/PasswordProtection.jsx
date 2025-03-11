'use client';

import { useState, useEffect } from 'react';
import { decryptContent } from '@/lib/encryption';
import { compileMDX } from 'next-mdx-remote/rsc';
import { LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export function PasswordProtection({ post, onDecrypt }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState(null);
  const [attempts, setAttempts] = useState(0);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Call the API to verify the password
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: post.slug,
          password: password.trim(),
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle different error types
        if (response.status === 429) {
          setError('Too many attempts. Please try again later.');
        } else {
          setError(data.error || 'Invalid password');
        }
        setAttempts(prev => prev + 1);
        setIsLoading(false);
        return;
      }
      
      // Password is correct, decrypt the content
      try {
        const { decryptionData } = data;
        
        // Decrypt the content using the provided keys
        const decrypted = decryptContent(
          post.encryptedContent,
          password.trim(),
          decryptionData.salt,
          decryptionData.iv,
          decryptionData.authTag
        );
        
        // Set the decrypted content
        setDecryptedContent(decrypted);
        
        // Call the parent component's callback with the decrypted content
        if (onDecrypt) {
          onDecrypt(decrypted);
        }
        
        // Clear the password field
        setPassword('');
        
      } catch (decryptError) {
        console.error('Decryption error:', decryptError);
        setError('Failed to decrypt content. Please try again.');
      }
      
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Determine if we should show a stronger warning based on attempts
  const showStrongWarning = attempts >= 3;

  return (
    <div className="w-full max-w-md mx-auto my-8 p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-md">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mb-4">
          <LockClosedIcon className="w-6 h-6 text-neutral-600 dark:text-neutral-300" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
          Password Protected Content
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          This content is password protected. Please enter the password to view it.
        </p>
      </div>
      
      {showStrongWarning && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-md">
          <div className="flex items-start">
            <ShieldCheckIcon className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 mr-2" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Multiple incorrect attempts detected. Please ensure you have the correct password.
            </p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="password" 
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900 dark:text-white"
            placeholder="Enter password"
            autoComplete="off"
            disabled={isLoading}
          />
        </div>
        
        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Verifying...' : 'Unlock Content'}
        </button>
      </form>
    </div>
  );
} 