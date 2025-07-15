# Citation System

I've created a comprehensive, lightweight citation system for your blog that integrates seamlessly with your existing MDX setup.

## Current State

❌ **Before**: Your blog had broken `:contentReference[oaicite:X]{index=X}` patterns that weren't handled by any component
✅ **After**: Clean, academic-style citation system with automatic bibliography generation

## Components Added

### 1. `CitationProvider` 
Manages all citations across a blog post and provides context to child components.

### 2. `Citation` 
Main citation component for inline academic references.

### 3. `Bibliography`
Automatically generates a references section at the end of posts.

### 4. `Cite` 
Shorthand component (alias for `Citation`).

## Usage Examples

### Basic Citation
```mdx
This algorithm was first introduced by Cauchy <Citation 
  author="Cauchy, A.L." 
  year="1847" 
  title="Méthode générale pour la résolution des systèmes d'équations simultanées" 
  venue="Comptes Rendus" 
/>.
```

### Citation with URL
```mdx
Recent work has shown promising results <Citation 
  author="Dauphin et al." 
  year="2014" 
  title="Identifying and attacking the saddle point problem in high-dimensional non-convex optimization"
  url="https://arxiv.org/abs/1406.2572"
  venue="NIPS" 
/>.
```

### Multiple Citations
```mdx
Several papers have explored this <Citation author="Smith et al." year="2020" title="Paper One" /> 
and <Citation author="Jones et al." year="2021" title="Paper Two" /> showing different approaches.
```

### Using the Cite Shorthand
```mdx
This is a shorter syntax <Cite author="Einstein" year="1905" title="Special Relativity" />.
```

## Features

✅ **Automatic Numbering**: Citations are automatically numbered [1], [2], etc.
✅ **Deduplication**: Same citation referenced multiple times gets the same number
✅ **Hover Tooltips**: Citations show author/title info on hover
✅ **Click Navigation**: Citations link to the bibliography entry
✅ **Academic Formatting**: Professional academic citation style
✅ **Dark Mode Support**: Integrates with your existing dark mode
✅ **Zero Bloat**: Uses your existing typography and styling

## Integration

The citation system is already integrated into:
- Main blog post component (`/blog/[slug]/page.js`)
- MDX processing (`lib/mdx.js`) 
- Protected content (`ProtectedContent.jsx`)

The `Bibliography` component automatically appears at the end of posts when citations are present.

## Migration Path

To replace existing broken citations:

**Before:**
```mdx
Some text :contentReference[oaicite:0]{index=0}.
```

**After:**
```mdx
Some text <Citation author="Author Name" year="2023" title="Paper Title" />.
```

## No Bloat Design

This system:
- Uses existing typography and spacing
- Leverages your current dark mode implementation  
- Follows your site's design patterns
- Adds minimal bundle size
- Works with all existing MDX features (MarginNote, Sidenote, etc.)

The citation system is now ready to use across all your blog posts!

## Example in Action

I've already updated `content/blog/high_dimension.mdx` to demonstrate the citation system in action. All four broken `:contentReference[oaicite:X]{index=X}` patterns have been replaced with proper Citation components:

1. **Cauchy (1847)** - Historical reference to gradient descent origins
2. **Dauphin et al. (2014)** - Saddle point paper with arXiv link
3. **Sagun et al. (2017)** - Hessian analysis paper with arXiv link  
4. **Kawaguchi (2016)** - Deep linear networks paper with arXiv link

When you visit the blog post, you'll see:
- Inline citations numbered [1], [2], [3], [4]
- Hover tooltips showing full citation details
- Clickable links to the references section
- Automatic bibliography at the end of the post

The system is working seamlessly with your existing MarginNote and Sidenote components! 