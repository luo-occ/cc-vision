import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatPercent(percent: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(percent / 100);
}

export function formatNumber(number: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(number);
}

export function getChangeColor(change: number): string {
  if (change > 0) return 'text-success-600';
  if (change < 0) return 'text-danger-600';
  return 'text-gray-600';
}

export function getChangeBgColor(change: number): string {
  if (change > 0) return 'bg-success-50';
  if (change < 0) return 'bg-danger-50';
  return 'bg-gray-50';
}