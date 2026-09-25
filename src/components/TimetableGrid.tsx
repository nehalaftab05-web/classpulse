"use client";

import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Video, 
  MapPin, 
  User, 
  Clock,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { TimetableSlot, Course } from "../types/classroom";

interface TimetableGridProps {
  slots: TimetableSlot[];
  courses: Course[];
}

const DAYS = [
  { id: 1, name: "Monday", short: "Mon" },
  { id: 2, name: "Tuesday", short: "Tue" },
  { id: 3, name: "Wednesday", short: "Wed" },
  { id: 4, name: "Thursday", short: "Thu" },
  { id: 5, name: "Friday", short: "Fri" },
];

export const TimetableGrid: React.FC<TimetableGridProps> = ({ slots, courses }) => {
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);
  const [activeCourseFilter, setActiveCourseFilter] = useState<string>("all");

  const filteredSlots = slots.filter((slot) => {
    if (activeCourseFilter === "all") return true;
    return slot.courseId === activeCourseFilter;
  });

  return (
    <div className="rounded-xl border border-borderSubtle bg-surface p-5 shadow-subtle">
      {/* Header & Filter pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm text-textPrimary">
              FAST-NU CFD Campus • BCS-5E
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-subtle text-textSecondary border border-borderSubtle">
              Fall 2026 (v3)
            </span>
          </div>
          <p className="text-xs text-textSecondary mt-0.5">
            Class timetable w.e.f. August 31, 2026 • 6 Registered Courses
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveCourseFilter("all")}
            className={`px-2.5 py-1 text-xs rounded-md transition-all font-medium ${
              activeCourseFilter === "all"
                ? "bg-textPrimary text-surface shadow-subtle"
                : "text-textSecondary hover:text-textPrimary hover:bg-subtle"
            }`}
          >
            All Courses
          </button>
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCourseFilter(c.id)}
              className={`px-2.5 py-1 text-xs rounded-md transition-all font-medium whitespace-nowrap ${
                activeCourseFilter === c.id
                  ? "bg-textPrimary text-surface shadow-subtle"
                  : "text-textSecondary hover:text-textPrimary hover:bg-subtle"
              }`}
            >
              {c.code}
            </button>
          ))}
        </div>
      </div>

      {/* 5-Day Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {DAYS.map((day) => {
          const daySlots = filteredSlots
            .filter((s) => s.dayOfWeek === day.id)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div
              key={day.id}
              className="flex flex-col rounded-lg border border-borderSubtle bg-canvas/50 p-2.5 min-h-[380px]"
            >
              {/* Day Header */}
              <div className="pb-2 mb-2.5 border-b border-borderSubtle flex items-center justify-between">
                <span className="font-semibold text-xs text-textPrimary">
                  {day.name}
                </span>
                <span className="text-[10px] font-mono text-textMuted">
                  {daySlots.length === 0 ? "Off" : `${daySlots.length} sessions`}
                </span>
              </div>

              {/* Slots */}
              <div className="flex-1 flex flex-col gap-2.5">
                {daySlots.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-4 text-center border border-dashed border-borderSubtle rounded-lg bg-subtle/30">
                    <span className="text-xs font-medium text-textSecondary">No scheduled lectures</span>
                    <span className="text-[11px] text-textMuted mt-1">Study / Project Day</span>
                  </div>
                ) : (
                  daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all duration-150 hover:shadow-subtle ${slot.color}`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono opacity-85 mb-1.5">
                        <span className="font-semibold">{slot.startTime} – {slot.endTime}</span>
                        <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">
                          {slot.room}
                        </span>
                      </div>

                      <h4 className="font-semibold text-xs leading-snug">
                        {slot.courseName}
                      </h4>

                      <div className="flex items-center justify-between text-[11px] opacity-80 mt-2.5 pt-1.5 border-t border-black/5 dark:border-white/10">
                        <span className="flex items-center gap-1 font-medium">
                          <User className="w-3 h-3 opacity-70" />
                          {slot.instructor}
                        </span>
                        {slot.meetLink && (
                          <span className="flex items-center gap-0.5 font-semibold text-emerald-700 dark:text-emerald-300 text-[10px]">
                            <Video className="w-3 h-3" />
                            Meet
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Inspector */}
      {selectedSlot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setSelectedSlot(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-surface border border-borderStrong p-5 shadow-elevated space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-subtle text-textSecondary border border-borderSubtle uppercase">
                  {selectedSlot.courseCode} • {selectedSlot.type}
                </span>
                <h3 className="text-sm font-bold text-textPrimary mt-1.5">
                  {selectedSlot.courseName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSlot(null)}
                className="text-textSecondary hover:text-textPrimary text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-textSecondary pt-2 border-t border-borderSubtle">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-textMuted" />
                <span>
                  <strong>Time:</strong> {selectedSlot.startTime} – {selectedSlot.endTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-textMuted" />
                <span>
                  <strong>Classroom / Venue:</strong> {selectedSlot.room}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-textMuted" />
                <span>
                  <strong>Course Faculty:</strong> {selectedSlot.instructor}
                </span>
              </div>
            </div>

            {selectedSlot.meetLink && (
              <a
                href={selectedSlot.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-md bg-textPrimary hover:opacity-90 text-surface font-semibold text-xs transition-opacity"
              >
                <Video className="w-3.5 h-3.5" />
                Join Virtual Class
              </a>
            )}

            <button
              onClick={() => setSelectedSlot(null)}
              className="w-full py-1.5 px-3 rounded-md bg-subtle hover:bg-borderSubtle text-textSecondary text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
