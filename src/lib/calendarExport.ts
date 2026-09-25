import { Assignment, TimetableSlot } from "../types/classroom";

/**
 * Generates an RFC 5545 compliant .ics (iCalendar) string for assignments and schedule
 */
export function generateIcsCalendar(
  assignments: Assignment[],
  slots: TimetableSlot[]
): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ClassPulse//Smart Academic Timetable//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:ClassPulse Academic Schedule",
    "X-WR-TIMEZONE:UTC",
  ];

  // Add Assignments as calendar events
  assignments.forEach((assignment) => {
    try {
      const dueDate = new Date(assignment.dueDate);
      const startStr = dueDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      // Event lasts 1 hour ending at due date
      const startDate = new Date(dueDate.getTime() - 60 * 60 * 1000);
      const startTimeStr = startDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:assignment-${assignment.id}@classpulse.app`,
        `DTSTAMP:${timestamp}`,
        `DTSTART:${startTimeStr}`,
        `DTEND:${startStr}`,
        `SUMMARY:[DUE] ${assignment.courseCode}: ${assignment.title}`,
        `DESCRIPTION:${assignment.description.replace(/\n/g, "\\n")} (Max Points: ${assignment.maxPoints || "N/A"})`,
        `CATEGORIES:${assignment.type.toUpperCase()}`,
        `STATUS:${assignment.status === "completed" ? "COMPLETED" : "CONFIRMED"}`,
        "BEGIN:VALARM",
        "TRIGGER:-PT2H",
        "ACTION:DISPLAY",
        `DESCRIPTION:Reminder: ${assignment.title} is due in 2 hours!`,
        "END:VALARM",
        "END:VEVENT"
      );
    } catch {
      // ignore invalid dates
    }
  });

  // Add Recurring Timetable Classes (Weekly)
  slots.forEach((slot) => {
    try {
      // Map day of week (1=Mon, ..., 7=Sun) to RRULE BYDAY (MO, TU, WE, TH, FR, SA, SU)
      const days = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
      const byDay = days[slot.dayOfWeek - 1] || "MO";

      // Calculate next occurrence
      const today = new Date();
      const currentDay = today.getDay() === 0 ? 7 : today.getDay(); // 1-7
      let dayDiff = slot.dayOfWeek - currentDay;
      if (dayDiff < 0) dayDiff += 7;

      const eventDate = new Date();
      eventDate.setDate(today.getDate() + dayDiff);

      const [startHour, startMin] = slot.startTime.split(":").map(Number);
      const [endHour, endMin] = slot.endTime.split(":").map(Number);

      eventDate.setHours(startHour, startMin, 0, 0);
      const startStr = eventDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      const endDate = new Date(eventDate);
      endDate.setHours(endHour, endMin, 0, 0);
      const endStr = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:slot-${slot.id}@classpulse.app`,
        `DTSTAMP:${timestamp}`,
        `DTSTART:${startStr}`,
        `DTEND:${endStr}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${byDay}`,
        `SUMMARY:${slot.courseCode} ${slot.courseName} (${slot.type.toUpperCase()})`,
        `LOCATION:${slot.room}`,
        `DESCRIPTION:Instructor: ${slot.instructor}${slot.meetLink ? ` \\nMeet: ${slot.meetLink}` : ""}`,
        "END:VEVENT"
      );
    } catch {
      // ignore
    }
  });

  icsContent.push("END:VCALENDAR");
  return icsContent.join("\r\n");
}

/**
 * Triggers a browser download of the .ics file
 */
export function downloadIcsFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Creates a direct Google Calendar web link for an assignment
 */
export function createGoogleCalendarUrl(assignment: Assignment): string {
  try {
    const due = new Date(assignment.dueDate);
    const start = new Date(due.getTime() - 60 * 60 * 1000); // 1 hr before

    const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");

    const dates = `${fmt(start)}/${fmt(due)}`;
    const title = encodeURIComponent(`[DUE] ${assignment.courseCode}: ${assignment.title}`);
    const details = encodeURIComponent(
      `${assignment.description}\n\nSubmitted via ClassPulse / Google Classroom\nMax Points: ${assignment.maxPoints || "N/A"}`
    );

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}`;
  } catch {
    return "https://calendar.google.com";
  }
}
