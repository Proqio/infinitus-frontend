import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...values: ClassValue[]) => twMerge(clsx(...values));

export { cn };
