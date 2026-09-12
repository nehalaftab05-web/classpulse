"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { 
  CheckSquare, 
  Clock, 
  CalendarPlus, 
  Plus, 
  Check, 
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { Assignment, TaskStatus } from "../types/classroom";
import { getUrgency, formatNiceDate } from "../lib/utils";
import { createGoogleCalendarUrl } from "../lib/calendarExport";

interface AssignmentBoardProps {
  assignments: Assignment[];
  onUpdateStatus: (id: string, newStatus: TaskStatus) => void;
  onAddNewAssignment: (assignment: Partial<Assignment>) => void;
}

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Turned In" },
];

export const AssignmentBoard: React.FC<AssignmentBoardProps> = ({
  assignments,
  onUpdateStatus,
  onAddNewAssignment,
}) => {
  const [filterType, setFilterType] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("CS 201");
  const [newHours, setNewHours] = useState("2");
  const [newDueDate, setNewDueDate] = useState("");

  const handleStatusChange = (id: string, nextStatus: TaskStatus) => {
    if (nextStatus === "completed") {
      try {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.7 },
        });
      } catch {}
    }
    onUpdateStatus(id, nextStatus);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const due = newDueDate ? new Date(newDueDate).toISOString() : new Date(Date.now() + 86400000 * 2).toISOString();

    onAddNewAssignment({
      title: newTitle,
      courseCode: newCourseCode,
      courseName: newCourseCode === "CS 201" ? "Data Structures" : newCourseCode,
      description: "Custom task added to coursework tracker.",
      dueDate: due,
      status: "todo",
      type: "assignment",
      estimatedHours: Number(newHours) || 2,
    });

    setNewTitle("");
    setNewDueDate("");
    setShowAddModal(false);
  };

  const filteredAssignments = assignments.filter((a) => {
    if (filterType === "all") return true;
    return a.type === filterType;
  });

  return (
    <div className="rounded-xl border border-borderSubtle bg-surface p-5 shadow-subtle">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="font-semibold text-sm text-textPrimary">
            Coursework & Submissions
          </h2>
          <p className="text-xs text-textSecondary mt-0.5">
            Manage assignment progress and deadlines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-md bg-subtle text-textPrimary border border-borderSubtle focus:outline-none focus:border-borderStrong font-medium"
          >
            <option value="all">All Types</option>
            <option value="assignment">Assignments</option>
            <option value="quiz">Quizzes</option>
            <option value="lab_report">Lab Reports</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-textPrimary text-surface hover:opacity-90 transition-opacity shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {COLUMNS.map((col) => {
          const colTasks = filteredAssignments.filter((a) => a.status === col.id);

          return (
            <div
              key={col.id}
              className="flex flex-col rounded-lg border border-borderSubtle bg-canvas/60 p-3 min-h-[350px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-borderSubtle">
                <span className="font-medium text-xs text-textPrimary">
                  {col.label}
                </span>
                <span className="font-mono text-xs text-textMuted font-medium">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards */}
              <div className="flex-1 flex flex-col gap-2.5">
                {colTasks.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center p-6 text-center">
                    <span className="text-xs text-textMuted italic">No tasks</span>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const urgency = getUrgency(task.dueDate);
                    const gCalUrl = createGoogleCalendarUrl(task);

                    return (
                      <div
                        key={task.id}
                        className={`p-3 rounded-lg border bg-surface hover:border-borderStrong transition-all shadow-subtle ${
                          col.id === "completed" ? "opacity-60 border-borderSubtle" : "border-borderSubtle"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-mono text-[10px] font-semibold text-textSecondary">
                            {task.courseCode}
                          </span>
                          <span className={`px-1.5 py-0.5 text-[10px] rounded ${urgency.badgeClass}`}>
                            {col.id === "completed" ? "Submitted" : urgency.label}
                          </span>
                        </div>

                        <h4 className={`text-xs font-medium text-textPrimary mb-1 leading-snug ${
                          col.id === "completed" ? "line-through text-textSecondary" : ""
                        }`}>
                          {task.title}
                        </h4>

                        <p className="text-[11px] text-textSecondary line-clamp-2 mb-2 leading-relaxed">
                          {task.description}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-borderSubtle text-[11px] text-textMuted font-mono">
                          <span>
                            {task.maxPoints ? `${task.maxPoints} pts` : ""} • Est {task.estimatedHours || 2}h
                          </span>

                          <div className="flex items-center gap-1">
                            <a
                              href={gCalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Sync to Calendar"
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
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            {col.id === "todo" && (
                              <button
                                onClick={() => handleStatusChange(task.id, "in_progress")}
                                className="px-2 py-0.5 rounded bg-subtle hover:bg-borderSubtle text-textPrimary text-[10px] font-medium transition-colors"
                              >
                                Start
                              </button>
                            )}
                            {col.id === "in_progress" && (
                              <button
                                onClick={() => handleStatusChange(task.id, "completed")}
                                className="px-2 py-0.5 rounded bg-textPrimary text-surface text-[10px] font-medium hover:opacity-90 transition-opacity"
                              >
                                Turn In
                              </button>
                            )}
                            {col.id === "completed" && (
                              <button
                                onClick={() => handleStatusChange(task.id, "todo")}
                                className="px-1.5 py-0.5 text-textSecondary hover:text-textPrimary text-[10px] transition-colors"
                              >
                                Reopen
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl bg-surface border border-borderStrong p-5 shadow-elevated space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-textPrimary">Add Coursework Task</h3>
              <button onClick={() => setShowAddModal(false)} className="text-textSecondary hover:text-textPrimary text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block text-textSecondary mb-1 font-medium">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 Practice Problems"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md bg-canvas border border-borderSubtle text-textPrimary placeholder-textMuted focus:outline-none focus:border-borderStrong"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-textSecondary mb-1 font-medium">Course</label>
                  <select
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md bg-canvas border border-borderSubtle text-textPrimary focus:outline-none focus:border-borderStrong font-medium"
                  >
                    <option value="CS 201">CS 201</option>
                    <option value="CS 304">CS 304</option>
                    <option value="CS 315">CS 315</option>
                    <option value="CS 220">CS 220</option>
                  </select>
                </div>
                <div>
                  <label className="block text-textSecondary mb-1 font-medium">Est. Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newHours}
                    onChange={(e) => setNewHours(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md bg-canvas border border-borderSubtle text-textPrimary focus:outline-none focus:border-borderStrong"
                  />
                </div>
              </div>

              <div>
                <label className="block text-textSecondary mb-1 font-medium">Due Date & Time</label>
                <input
                  type="datetime-local"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md bg-canvas border border-borderSubtle text-textPrimary focus:outline-none focus:border-borderStrong font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-1.5 px-3 rounded-md bg-textPrimary hover:opacity-90 text-surface font-medium transition-opacity"
                >
                  Save Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-1.5 px-3 rounded-md bg-subtle hover:bg-borderSubtle text-textSecondary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
