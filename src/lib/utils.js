import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function throttle(fn, ms) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= ms) {
            lastCall = now;
            return fn.apply(this, args);
        }
    };
}
