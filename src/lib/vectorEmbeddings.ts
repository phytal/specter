/**
 * Utility functions for generating and comparing vector embeddings for text similarity
 */

// Simple implementation of text-to-vector transformation using TF-IDF principles
export function textToVector(text: string): Record<string, number> {
  // Normalize and tokenize the text
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(token => token.length > 1); // Filter out single-character tokens
    
  const vector: Record<string, number> = {};
  
  // Calculate term frequency
  for (const token of tokens) {
    vector[token] = (vector[token] || 0) + 1;
  }
  
  // Apply basic IDF-like normalization (dampening frequent terms)
  const totalTokens = tokens.length;
  for (const token in vector) {
    // Normalize to account for document length
    vector[token] = vector[token] / totalTokens;
    
    // Down-weight common terms like "the", "is", etc.
    if (commonWords.includes(token)) {
      vector[token] *= 0.3;
    }
  }
  
  return vector;
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(vector1: Record<string, number>, vector2: Record<string, number>): number {
  const keys1 = Object.keys(vector1);
  const keys2 = Object.keys(vector2);
  
  if (keys1.length === 0 || keys2.length === 0) return 0;
  
  // Calculate dot product
  let dotProduct = 0;
  for (const key of keys1) {
    if (key in vector2) {
      dotProduct += vector1[key] * vector2[key];
    }
  }
  
  // Calculate magnitudes
  let magnitude1 = 0;
  for (const key of keys1) {
    magnitude1 += vector1[key] * vector1[key];
  }
  
  let magnitude2 = 0;
  for (const key of keys2) {
    magnitude2 += vector2[key] * vector2[key];
  }
  
  // Compute cosine similarity
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}

// Calculate text similarity between two strings (0-1)
export function calculateTextSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;
  const vector1 = textToVector(text1);
  const vector2 = textToVector(text2);
  return cosineSimilarity(vector1, vector2);
}

// Common English words to be down-weighted in similarity calculations
const commonWords = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I', 'it', 'for',
  'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by',
  'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one',
  'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about',
  'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no',
  'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some',
  'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
  'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our',
  'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
  'give', 'day', 'most', 'us'
];
