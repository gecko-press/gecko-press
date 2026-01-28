export function calculateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, "").trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = 200;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}
