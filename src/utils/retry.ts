/**
 * Retry utility for handling transient failures
 * Implements exponential backoff with jitter
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

/**
 * Execute a function with retry logic and exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries, baseDelay, maxDelay } = { ...DEFAULT_OPTIONS, ...options };
  const { onRetry } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff and jitter
      const exponentialDelay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 0.3 * exponentialDelay;
      const delay = Math.min(exponentialDelay + jitter, maxDelay);

      if (onRetry) {
        onRetry(attempt + 1, lastError);
      } else {
        console.warn(`⚠️ Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms...`, lastError.message);
      }

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute multiple promises with retry, returning successful results
 * Failed promises return null instead of throwing
 */
export async function withRetryAll<T>(
  fns: Array<() => Promise<T>>,
  options: RetryOptions = {}
): Promise<Array<T | null>> {
  return Promise.all(
    fns.map(async (fn) => {
      try {
        return await withRetry(fn, options);
      } catch {
        return null;
      }
    })
  );
}
