import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { UrgencyLevel } from "../types/classroom";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUrgency(dueDateIso: string): {
  level: UrgencyLevel;
  label: string;
  badgeClass: string;
  cardBorderClass: string;
  isPastDue: boolean;
} {
  const now = new Date();
  const due = new Date(dueDateIso);
  const diffMs = due.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffMs < 0) {
    return {
      level: 'critical',
      label: 'Past Due',
      badgeClass: 'bg-zinc-100 text-zinc-600 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
      cardBorderClass: 'border-zinc-300 dark:border-zinc-700',
      isPastDue: true,
    };
  }

  if (diffHours <= 12) {
    const hours = Math.floor(diffHours);
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return {
      level: 'critical',
      label: `Due in ${hours}h ${mins}m`,
      badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200 font-medium dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/60',
      cardBorderClass: 'border-rose-300 dark:border-rose-900/70',
      isPastDue: false,
    };
  }

  if (diffHours <= 24) {
    return {
      level: 'soon',
      label: `Due today (${Math.floor(diffHours)}h left)`,
      badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200 font-medium dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60',
      cardBorderClass: 'border-amber-200 dark:border-amber-900/50',
      isPastDue: false,
    };
  }

  if (diffHours <= 48) {
    return {
      level: 'upcoming',
      label: 'Due tomorrow',
      badgeClass: 'bg-slate-100 text-slate-800 border border-slate-200 font-medium dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700',
      cardBorderClass: 'border-slate-200 dark:border-slate-800',
      isPastDue: false,
    };
  }

  const days = Math.ceil(diffHours / 24);
  return {
    level: 'normal',
    label: `In ${days} days`,
    badgeClass: 'bg-zinc-50 text-zinc-600 border border-zinc-200 font-medium dark:bg-zinc-800/60 dark:text-zinc-400 dark:border-zinc-700/80',
    cardBorderClass: 'border-zinc-200 dark:border-zinc-800',
    isPastDue: false,
  };
}

export function formatNiceDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return isoString;
  }
}
