/**
 * Extracts the last tsx/ts/jsx/js code block from a markdown string.
 * Returns an empty string if no code block is found.
 */
export function parseCodeBlock(markdown: string): string {
  const pattern = /```(?:tsx|ts|jsx|js)\s*\n([\s\S]*?)```/g;
  let lastMatch = "";
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(markdown)) !== null) {
    lastMatch = match[1].trim();
  }

  return lastMatch;
}
