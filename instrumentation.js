export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV === 'production') {
    const { getHighlighter } = await import('shiki');
    await getHighlighter({
      themes: ['one-dark-pro'],
      langs: [
        'javascript',
        'typescript',
        'jsx',
        'tsx',
        'python',
        'html',
        'css',
        'json',
        'yaml',
        'markdown',
        'bash',
        'shell',
        'diff',
      ],
    });
    console.log('[instrumentation] Shiki highlighter prewarmed');
  }
}
