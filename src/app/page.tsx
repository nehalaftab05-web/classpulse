"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  CheckSquare, 
  BookOpen, 
  ExternalLink,
  Info
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { DeadlineRadar } from "../components/DeadlineRadar";
import { TimetableGrid } from "../components/TimetableGrid";
import { AssignmentBoard } from "../components/AssignmentBoard";
import { WorkloadAnalytics } from "../components/WorkloadAnalytics";
import { GoogleConnectModal } from "../components/GoogleConnectModal";
import { 
  mockUser, 
  mockCourses, 
  mockTimetableSlots, 
  getMockAssignments 
} from "../data/mockClassroom";
import { Assignment, TaskStatus, UserProfile } from "../types/classroom";
import { generateIcsCalendar, downloadIcsFile } from "../lib/calendarExport";

export default function Home() {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [assignments, setAssignments] = useState<Assignment[]>(getMockAssignments());
  const [activeTab, setActiveTab] = useState<"timetable" | "kanban" | "courses">("timetable");
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync theme with document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleStatus = (id: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextStatus: TaskStatus = a.status === "completed" ? "todo" : "completed";
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
    showToast("Task status updated");
  };

  const handleUpdateStatus = (id: string, newStatus: TaskStatus) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    if (newStatus === "completed") {
      showToast("Assignment turned in");
    }
  };

  const handleAddNewAssignment = (newAssignment: Partial<Assignment>) => {
    const id = "custom-" + Date.now();
    const task: Assignment = {
      id,
      courseId: "c1",
      courseName: newAssignment.courseName || "Custom Course",
      courseCode: newAssignment.courseCode || "CS 101",
      title: newAssignment.title || "Untitled Task",
      description: newAssignment.description || "",
      dueDate: newAssignment.dueDate || new Date().toISOString(),
      status: "todo",
      type: newAssignment.type || "assignment",
      estimatedHours: newAssignment.estimatedHours || 2,
    };
    setAssignments((prev) => [task, ...prev]);
    showToast("Added task to coursework");
  };

  const handleExportCalendar = () => {
    const icsString = generateIcsCalendar(assignments, mockTimetableSlots);
    downloadIcsFile("ClassPulse_Schedule.ics", icsString);
    showToast("Downloaded .ics calendar file");
  };

  const handleConnectSuccess = (email: string) => {
    setUser({
      name: email.split("@")[0].replace(".", " "),
      email: email,
      institution: "Google Classroom Connected",
      isDemoMode: false,
    });
    setIsDemoMode(false);
    showToast(`Connected to ${email}`);
  };

  return (
    <div className="min-h-screen bg-canvas text-textPrimary flex flex-col transition-colors">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-3.5 py-2 rounded-lg bg-textPrimary text-surface shadow-elevated text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* Navigation */}
      <Navbar
        user={user}
        isDemoMode={isDemoMode}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onToggleDemoMode={() => {
          setIsDemoMode(true);
          setUser(mockUser);
          setAssignments(getMockAssignments());
          showToast("Switched to Demo Coursework");
        }}
        onOpenGoogleModal={() => setIsGoogleModalOpen(true)}
        onExportIcs={handleExportCalendar}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Notice bar in demo mode */}
        {isDemoMode && (
          <div className="rounded-lg border border-borderSubtle bg-subtle/70 px-4 py-2.5 flex items-center justify-between text-xs text-textSecondary">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-textMuted" />
              <span>
                Viewing sample <strong>Computer Science (Semester 4)</strong> coursework & schedule.
              </span>
            </div>
            <button
              onClick={() => setIsGoogleModalOpen(true)}
              className="text-textPrimary hover:underline font-medium"
            >
              Connect Real Classroom →
            </button>
          </div>
        )}

        {/* Analytics Bar */}
        <WorkloadAnalytics assignments={assignments} />

        {/* Deadline Radar */}
        <DeadlineRadar
          assignments={assignments}
          onToggleStatus={handleToggleStatus}
        />

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-borderSubtle pb-2">
          <button
            onClick={() => setActiveTab("timetable")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "timetable"
                ? "bg-textPrimary text-surface shadow-subtle"
                : "text-textSecondary hover:text-textPrimary hover:bg-subtle"
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Weekly Schedule</span>
          </button>

          <button
            onClick={() => setActiveTab("kanban")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "kanban"
                ? "bg-textPrimary text-surface shadow-subtle"
                : "text-textSecondary hover:text-textPrimary hover:bg-subtle"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Coursework Tasks</span>
          </button>

          <button
            onClick={() => setActiveTab("courses")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "courses"
                ? "bg-textPrimary text-surface shadow-subtle"
                : "text-textSecondary hover:text-textPrimary hover:bg-subtle"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Enrolled Courses ({mockCourses.length})</span>
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === "timetable" && (
          <TimetableGrid slots={mockTimetableSlots} courses={mockCourses} />
        )}

        {activeTab === "kanban" && (
          <AssignmentBoard
            assignments={assignments}
            onUpdateStatus={handleUpdateStatus}
            onAddNewAssignment={handleAddNewAssignment}
          />
        )}

        {activeTab === "courses" && (
          <div className="rounded-xl border border-borderSubtle bg-surface p-5 shadow-subtle">
            <div className="mb-4">
              <h2 className="font-semibold text-sm text-textPrimary">
                Active Enrolled Courses
              </h2>
              <p className="text-xs text-textSecondary mt-0.5">
                Instructors, classroom locations, and video links
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mockCourses.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-lg border border-borderSubtle bg-canvas space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-subtle text-textPrimary border border-borderSubtle">
                      {c.code}
                    </span>
                    <span className="text-[11px] text-textMuted font-mono">
                      Section {c.section}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-textPrimary">{c.name}</h3>
                    <p className="text-[11px] text-textSecondary mt-0.5 leading-relaxed">{c.description}</p>
                  </div>

                  <div className="text-[11px] text-textSecondary pt-2 border-t border-borderSubtle space-y-0.5">
                    <p><strong>Instructor:</strong> {c.instructor}</p>
                    <p><strong>Venue:</strong> {c.room}</p>
                  </div>

                  {c.meetLink && (
                    <a
                      href={c.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-textPrimary hover:underline pt-1"
                    >
                      <span>Join Class Meet</span>
                      <ExternalLink className="w-3 h-3 text-textSecondary" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Understated Footer */}
      <footer className="border-t border-borderSubtle py-5 text-center text-xs text-textMuted bg-surface transition-colors mt-8">
        <p className="font-medium text-textSecondary">
          ClassPulse • Google Classroom Hub & Academic Schedule
        </p>
        <p className="text-[11px] mt-0.5">
          Designed with clean typography, calendar sync, and zero AI gradient clutter.
        </p>
      </footer>

      {/* Connect Modal */}
      <GoogleConnectModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onConnectSuccess={handleConnectSuccess}
      />
    </div>
  );
}
