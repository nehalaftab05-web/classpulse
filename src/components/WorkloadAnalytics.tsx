"use client";

import React from "react";
import { Assignment } from "../types/classroom";

interface WorkloadAnalyticsProps {
  assignments: Assignment[];
}

export const WorkloadAnalytics: React.FC<WorkloadAnalyticsProps> = ({ assignments }) => {
  const pending = assignments.filter((a) => a.status !== "completed");
  const completed = assignments.filter((a) => a.status === "completed");

  const totalEstimatedHours = pending.reduce((acc, curr) => acc + (curr.estimatedHours || 2), 0);
  const totalPoints = pending.reduce((acc, curr) => acc + (curr.maxPoints || 0), 0);
  const completionPercentage = assignments.length > 0 
    ? Math.round((completed.length / assignments.length) * 100) 
    : 100;

  return (
    <div className="rounded-xl border border-borderSubtle bg-surface p-4 shadow-subtle">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-borderSubtle">
        {/* Metric 1 */}
        <div className="p-3 sm:first:pl-1">
          <p className="text-[11px] font-medium text-textSecondary uppercase tracking-wider">
            Pending Tasks
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-2xl font-semibold text-textPrimary">
              {pending.length}
            </span>
            <span className="text-[11px] text-textMuted">
              of {assignments.length} total
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-3 sm:px-4">
          <p className="text-[11px] font-medium text-textSecondary uppercase tracking-wider">
            Study Hours Needed
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-2xl font-semibold text-textPrimary">
              ~{totalEstimatedHours}h
            </span>
            <span className="text-[11px] text-textMuted">
              estimated load
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-3 sm:px-4">
          <p className="text-[11px] font-medium text-textSecondary uppercase tracking-wider">
            Points at Stake
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-2xl font-semibold text-textPrimary">
              {totalPoints}
            </span>
            <span className="text-[11px] text-textMuted">
              grade weight
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-3 sm:px-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-textSecondary uppercase tracking-wider">
              Completion Rate
            </p>
            <span className="font-mono text-xs font-semibold text-textPrimary">
              {completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-subtle rounded-full h-1.5 mt-2.5 overflow-hidden border border-borderSubtle">
            <div
              className="bg-textPrimary h-full rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
