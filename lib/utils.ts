import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return `${str.slice(0, maxLength - 3)}...`;
}

/** Default client-side timeout (milliseconds) used for user-facing calls */
export const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Race a promise against a timeout. If the timeout fires first the returned
 * promise rejects with `TimeoutError`.
 */
export function withTimeout<T>(
  p: Promise<T>,
  ms: number = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => {
      reject(new Error(`Timeout after ${ms}ms`));
    }, ms);

    p.then((v) => {
      clearTimeout(id);
      resolve(v);
    }).catch((err) => {
      clearTimeout(id);
      reject(err);
    });
  });
}
