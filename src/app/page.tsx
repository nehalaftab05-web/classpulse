"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  CheckSquare, 
  BookOpen, 
  ExternalLink,
  Info,
  CheckCircle2,
  GraduationCap
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
  const [user, setUser] = useState<UserProfile>({
    name: "Nehal Aftab",
    email: "f240518@cfd.nu.edu.pk",
    institution: "FAST-NU CFD Campus (BCS-5E)",
    isDemoMode: false,
  });
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [assignments, setAssignments] = useState<Assignment[]>(getMockAssignments());
  const [activeTab, setActiveTab] = useState<"timetable" | "kanban" | "courses">("timetable");
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    showToast("Coursework status updated");
  };

  const handleUpdateStatus = (id: string, newStatus: TaskStatus) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    if (newStatus === "completed") {
      showToast("Assignment turned in to Google Classroom!");
    }
  };

  const handleAddNewAssignment = (newAssignment: Partial<Assignment>) => {
    const id = "custom-" + Date.now();
    const task: Assignment = {
      id,
      courseId: "c1",
      courseName: newAssignment.courseName || "Computer Architecture",
      courseCode: newAssignment.courseCode || "CS3001",
      title: newAssignment.title || "Untitled Task",
      description: newAssignment.description || "",
      dueDate: newAssignment.dueDate || new Date().toISOString(),
      status: "todo",
      type: newAssignment.type || "assignment",
      estimatedHours: newAssignment.estimatedHours || 2,
    };
    setAssignments((prev) => [task, ...prev]);
    showToast("Added task to FAST-NU schedule");
  };

  const handleExportCalendar = () => {
    const icsString = generateIcsCalendar(assignments, mockTimetableSlots);
    downloadIcsFile("FAST_NU_BCS_5E_Schedule.ics", icsString);
    showToast("Downloaded FAST_NU_BCS_5E_Schedule.ics for Apple / Google Calendar");
  };

  const handleConnectSuccess = (email: string) => {
    setUser({
      name: "Nehal Aftab",
      email: email || "f240518@cfd.nu.edu.pk",
      institution: "FAST-NU CFD Campus (BCS-5E)",
      isDemoMode: false,
    });
    setIsDemoMode(false);
    showToast(`Google Classroom synced with ${email}`);
  };

  return (
    <div className="min-h-screen bg-canvas text-textPrimary flex flex-col transition-colors">
      {/* Toast Notification */}
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
          showToast("Switched view");
        }}
        onOpenGoogleModal={() => setIsGoogleModalOpen(true)}
        onExportIcs={handleExportCalendar}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* FAST-NU Campus Header Banner */}
        <div className="rounded-xl border border-borderSubtle bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-subtle border border-borderSubtle flex items-center justify-center text-textPrimary">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-textPrimary">
                  FAST-NU CFD Campus • BCS-5E
                </h1>
                <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
                  <CheckCircle2 className="w-3 h-3" />
                  GCR Connected
                </span>
              </div>
              <p className="text-xs text-textSecondary mt-0.5">
                Student ID: <code className="font-mono text-[11px] text-textPrimary font-semibold">f240518@cfd.nu.edu.pk</code> • Section BCS-5E (Fall 2026)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCalendar}
              className="px-3 py-1.5 rounded-md bg-subtle hover:bg-borderSubtle text-textPrimary text-xs font-medium border border-borderSubtle transition-all"
            >
              Export Timetable (.ics)
            </button>
            <button
              onClick={() => setIsGoogleModalOpen(true)}
              className="px-3 py-1.5 rounded-md bg-textPrimary text-surface text-xs font-medium hover:opacity-90 transition-opacity"
            >
              Sync Classroom
            </button>
          </div>
        </div>

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
            <span>BCS-5E Timetable Matrix</span>
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
            <span>Coursework & Quizzes</span>
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
            <span>Enrolled Subjects ({mockCourses.length})</span>
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
                FAST-NU Enrolled Courses & Faculty
              </h2>
              <p className="text-xs text-textSecondary mt-0.5">
                Official instructors and classroom venues for BCS-5E
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
                      Venue: {c.room}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-textPrimary">{c.name}</h3>
                    <p className="text-[11px] text-textSecondary mt-0.5 leading-relaxed">{c.description}</p>
                  </div>

                  <div className="text-[11px] text-textSecondary pt-2 border-t border-borderSubtle space-y-0.5">
                    <p><strong>Faculty:</strong> {c.instructor}</p>
                    <p><strong>Class Section:</strong> {c.section}</p>
                  </div>

                  {c.meetLink && (
                    <a
                      href={c.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-textPrimary hover:underline pt-1"
                    >
                      <span>Join Virtual Classroom</span>
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
          ClassPulse • FAST-NU CFD Campus Academic Hub
        </p>
        <p className="text-[11px] mt-0.5">
          Fall 2026 (Version-3) Timetable • Google Classroom Integration
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
