"use client";

import React, { useState } from "react";
import { 
  FileUp, 
  ClipboardPaste, 
  ExternalLink, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  PlusCircle,
  Calendar
} from "lucide-react";
import { parseIcsContent, parseClassroomPastedText } from "../lib/classroomParser";
import { Course, Assignment } from "../types/classroom";

interface GoogleConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncSuccess: (data: { courses: Course[]; assignments: Assignment[]; email: string }) => void;
}

export const GoogleConnectModal: React.FC<GoogleConnectModalProps> = ({
  isOpen,
  onClose,
  onSyncSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"paste" | "upload" | "manual">("paste");
  const [pastedText, setPastedText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [studentEmail] = useState("f240518@cfd.nu.edu.pk");

  // Manual quick add fields
  const [manualTitle, setManualTitle] = useState("");
  const [manualCourse, setManualCourse] = useState("CS3004 Computer Networks");
  const [manualDueDate, setManualDueDate] = useState("");
  const [manualPoints, setManualPoints] = useState("20");

  if (!isOpen) return null;

  // 1. Handle Paste Text from classroom.google.com/a
  const handleParsePastedText = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!pastedText.trim()) {
      setErrorMessage("Please paste the text copied from your Google Classroom To-Do tab.");
      return;
    }

    try {
      const parsedAssignments = parseClassroomPastedText(pastedText);
      if (parsedAssignments.length === 0) {
        // Fallback: create an assignment from the text
        const singleTask: Assignment = {
          id: `paste-${Date.now()}`,
          courseId: "c1",
          courseCode: "FAST-NU",
          courseName: "Google Classroom Coursework",
          title: pastedText.split("\n")[0].substring(0, 80),
          description: pastedText,
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          status: "todo",
          type: "assignment",
          estimatedHours: 3,
        };
        onSyncSuccess({
          courses: [],
          assignments: [singleTask],
          email: studentEmail,
        });
      } else {
        onSyncSuccess({
          courses: [],
          assignments: parsedAssignments,
          email: studentEmail,
        });
      }
      onClose();
    } catch {
      setErrorMessage("Could not parse the pasted text. Please check the content.");
    }
  };

  // 2. Handle File Upload (.ics from Google Classroom or Google Calendar)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = parseIcsContent(content);
        if (parsed.length === 0) {
          setErrorMessage("No upcoming events or assignments found in this .ics calendar file.");
        } else {
          onSyncSuccess({
            courses: [],
            assignments: parsed,
            email: studentEmail,
          });
          onClose();
        }
      } catch {
        setErrorMessage("Error reading the calendar file. Make sure it is an .ics file.");
      }
    };
    reader.readAsText(file);
  };

  // 3. Handle Manual Direct Add
  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const newTask: Assignment = {
      id: `manual-${Date.now()}`,
      courseId: "c1",
      courseCode: manualCourse.split(" ")[0] || "FAST-NU",
      courseName: manualCourse,
      title: manualTitle.trim(),
      description: "Live assignment entered for FAST-NU CFD BCS-5E.",
      dueDate: manualDueDate ? new Date(manualDueDate).toISOString() : new Date(Date.now() + 86400000 * 2).toISOString(),
      maxPoints: Number(manualPoints) || 20,
      status: "todo",
      type: manualTitle.toLowerCase().includes("quiz") ? "quiz" : "assignment",
      estimatedHours: 3,
    };

    onSyncSuccess({
      courses: [],
      assignments: [newTask],
      email: studentEmail,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-surface border border-borderStrong p-6 shadow-elevated space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-textPrimary">
              Sync Real FAST-NU Google Classroom
            </h3>
            <p className="text-xs text-textSecondary mt-0.5">
              Direct import for student: <span className="font-mono text-textPrimary font-medium">{studentEmail}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-textSecondary hover:text-textPrimary text-xs p-1">✕</button>
        </div>

        {/* Informational banner about FAST IT restriction */}
        <div className="p-3 rounded-lg bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-200 dark:border-amber-900/60 text-[11px] flex items-start gap-2 leading-relaxed">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div>
            <strong>FAST-NU IT Security Policy:</strong> FAST CFD disables Google Developers & third-party OAuth access for student accounts. Use the two direct sync methods below (no developer permissions needed!):
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 border-b border-borderSubtle pb-1 text-xs">
          <button
            onClick={() => setActiveTab("paste")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === "paste"
                ? "bg-textPrimary text-surface"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Paste GCR To-Do (Fastest)</span>
          </button>

          <button
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === "upload"
                ? "bg-textPrimary text-surface"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Upload Calendar (.ics)</span>
          </button>

          <button
            onClick={() => setActiveTab("manual")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === "manual"
                ? "bg-textPrimary text-surface"
                : "text-textSecondary hover:text-textPrimary"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Exact Task</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-2.5 rounded-lg bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200 border border-rose-200 dark:border-rose-900/60 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Tab 1: Paste GCR To-Do List */}
        {activeTab === "paste" && (
          <form onSubmit={handleParsePastedText} className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-textSecondary font-medium">
                  Copy & Paste from Google Classroom:
                </label>
                <a
                  href="https://classroom.google.com/u/0/a"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-textPrimary hover:underline flex items-center gap-0.5"
                >
                  <span>Open GCR To-Do Tab</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <p className="text-[11px] text-textMuted leading-relaxed">
                1. Open <a href="https://classroom.google.com/u/0/a" target="_blank" rel="noopener noreferrer" className="underline font-medium text-textPrimary">classroom.google.com/to-do</a> with your FAST account.<br/>
                2. Select all text (Ctrl+A or drag across your pending assignments) and paste it below:
              </p>
            </div>

            <textarea
              rows={4}
              required
              placeholder="Example:&#10;Computer Networks&#10;Lab Evaluation 3 - Socket Programming&#10;Due Tuesday, 11:59 PM&#10;&#10;Design and Analysis of Algorithms&#10;Quiz 1: Master Theorem&#10;Due Wednesday, 10:15 AM"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-canvas border border-borderSubtle text-textPrimary placeholder-textMuted focus:outline-none focus:border-borderStrong font-mono text-[11px]"
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2 px-4 rounded-md bg-textPrimary hover:opacity-90 text-surface font-semibold text-xs transition-opacity flex items-center justify-center gap-2 shadow-subtle"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Parse & Sync Real Tasks</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3 rounded-md bg-subtle hover:bg-borderSubtle text-textSecondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Upload Calendar (.ics) */}
        {activeTab === "upload" && (
          <div className="space-y-3.5 text-xs">
            <div className="p-3 rounded-lg bg-subtle border border-borderSubtle space-y-1.5 leading-relaxed text-[11px] text-textSecondary">
              <span className="font-semibold text-textPrimary flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                From Google Calendar / Classroom:
              </span>
              <p>
                In Google Calendar (<a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="underline font-medium text-textPrimary">calendar.google.com</a>), your Google Classroom courses have an automatic calendar. Under <strong>Settings ➔ Import & Export</strong>, click <strong>Export</strong> to download your .ics file and upload it below.
              </p>
            </div>

            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-borderSubtle hover:border-borderStrong rounded-lg cursor-pointer bg-canvas/60 transition-colors">
              <FileUp className="w-8 h-8 text-textSecondary mb-2" />
              <span className="text-xs font-medium text-textPrimary">Click to select .ics Calendar file</span>
              <span className="text-[10px] text-textMuted mt-0.5">Supports standard iCalendar (.ics) exports</span>
              <input
                type="file"
                accept=".ics,text/calendar"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 px-3 rounded-md bg-subtle hover:bg-borderSubtle text-textSecondary transition-colors text-xs"
            >
              Close
            </button>
          </div>
        )}

        {/* Tab 3: Add Exact Task Manually */}
        {activeTab === "manual" && (
          <form onSubmit={handleManualAdd} className="space-y-3 text-xs">
            <div>
              <label className="block text-textSecondary mb-1 font-medium">Subject / Course</label>
              <select
                value={manualCourse}
                onChange={(e) => setManualCourse(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md bg-canvas border border-borderSubtle text-textPrimary font-medium focus:outline-none focus:border-borderStrong"
              >
                <option value="CS3001 Computer Architecture">CS3001 Computer Architecture (Mr. Saad)</option>
                <option value="CS3004 Computer Networks">CS3004 Computer Networks (Dr. Umar)</option>
                <option value="CS3004-L Computer Networks Lab">CS3004-L Computer Networks Lab (Mr. Abubakar)</option>
                <option value="CS3002 Design & Analysis of Algorithms">CS3002 Design & Analysis of Algorithms (Ms. Batisha)</option>
                <option value="CS3008 Applied HCI">CS3008 Applied HCI (Mr. Hannan)</option>
                <option value="SS2003 Technical & Business Writing">SS2003 Technical & Business Writing (Ms. Tehreem)</option>
              </select>
            </div>

            <div>
              <label className="block text-textSecondary mb-1 font-medium">Assignment / Task Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Lab 4: Wireshark Packet Analysis or Quiz 2"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md bg-canvas border border-borderSubtle text-textPrimary focus:outline-none focus:border-borderStrong"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-textSecondary mb-1 font-medium">Due Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={manualDueDate}
                  onChange={(e) => setManualDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md bg-canvas border border-borderSubtle text-textPrimary font-mono text-[11px] focus:outline-none focus:border-borderStrong"
                />
              </div>
              <div>
                <label className="block text-textSecondary mb-1 font-medium">Total Marks / Points</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={manualPoints}
                  onChange={(e) => setManualPoints(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md bg-canvas border border-borderSubtle text-textPrimary focus:outline-none focus:border-borderStrong"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 px-4 rounded-md bg-textPrimary hover:opacity-90 text-surface font-semibold text-xs transition-opacity flex items-center justify-center gap-2"
              >
                <span>Save to Dashboard & Timetable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3 rounded-md bg-subtle hover:bg-borderSubtle text-textSecondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
