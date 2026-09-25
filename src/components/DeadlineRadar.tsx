"use client";

import React, { useState, useEffect } from "react";
import { 
  Clock, 
  CalendarPlus, 
  Check, 
  ArrowUpRight,
  AlertCircle
} from "lucide-react";
import { Assignment } from "../types/classroom";
import { getUrgency, formatNiceDate } from "../lib/utils";
import { createGoogleCalendarUrl } from "../lib/calendarExport";

interface DeadlineRadarProps {
  assignments: Assignment[];
  onToggleStatus: (id: string) => void;
}

export const DeadlineRadar: React.FC<DeadlineRadarProps> = ({
  assignments,
  onToggleStatus,
}) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const activeAssignments = assignments
    .filter((a) => a.status !== "completed")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const upcomingTasks = activeAssignments.slice(0, 4);

  return (
    <div className="rounded-xl border border-borderSubtle bg-surface p-5 shadow-subtle">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-sm text-textPrimary">
            Upcoming Deadlines
          </h2>
          <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-subtle text-textSecondary border border-borderSubtle">
            {activeAssignments.length} pending
          </span>
        </div>
        <p className="text-xs text-textMuted hidden sm:block">
          Auto-sorted by due date urgency
        </p>
      </div>

      {upcomingTasks.length === 0 ? (
        <div className="py-8 text-center rounded-lg border border-dashed border-borderSubtle bg-subtle/50">
          <p className="text-xs text-textSecondary">No upcoming deadlines this week.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {upcomingTasks.map((task) => {
            const urgency = getUrgency(task.dueDate);
            const gCalUrl = createGoogleCalendarUrl(task);

            return (
              <div
                key={task.id}
                className="flex flex-col justify-between p-3.5 rounded-lg border border-borderSubtle bg-canvas hover:border-borderStrong transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[11px] font-semibold text-textSecondary">
                      {task.courseCode}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] rounded-md ${urgency.badgeClass}`}>
                      {urgency.label}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-textPrimary line-clamp-2 leading-snug">
                    {task.title}
                  </h3>

                  <p className="text-[11px] text-textSecondary mt-1 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-borderSubtle flex items-center justify-between text-xs">
                  <span className="text-[11px] text-textMuted flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-textMuted" />
                    {formatNiceDate(task.dueDate)}
                  </span>

                  <div className="flex items-center gap-1">
                    <a
                      href={gCalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Add to Google Calendar"
                      className="p-1 rounded text-textSecondary hover:text-textPrimary hover:bg-subtle transition-colors"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                    </a>

                    {task.submissionUrl && (
                      <a
                        href={task.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open in Classroom"
                        className="p-1 rounded text-textSecondary hover:text-textPrimary hover:bg-subtle transition-colors"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      onClick={() => onToggleStatus(task.id)}
                      title="Mark complete"
                      className="p-1 rounded text-textSecondary hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
