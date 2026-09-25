import { Assignment } from "../types/classroom";

/**
 * Parses raw .ics (iCalendar) text from Google Classroom / Google Calendar
 */
export function parseIcsContent(icsText: string): Assignment[] {
  const events: Assignment[] = [];
  const lines = icsText.split(/\r\n|\n|\r/);
  
  let currentEvent: Partial<Assignment> | null = null;
  let inEvent = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      currentEvent = {
        id: `ics-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        status: "todo",
        type: "assignment",
        estimatedHours: 3,
        courseCode: "FAST-NU",
        courseName: "Classroom Course",
      };
      continue;
    }

    if (line === "END:VEVENT" && inEvent && currentEvent) {
      if (currentEvent.title && currentEvent.dueDate) {
        events.push(currentEvent as Assignment);
      }
      inEvent = false;
      currentEvent = null;
      continue;
    }

    if (!inEvent || !currentEvent) continue;

    if (line.startsWith("SUMMARY:")) {
      const summary = line.replace("SUMMARY:", "").trim();
      currentEvent.title = summary;

      // Extract course code if present in brackets or prefix (e.g. [CS3001] or CS3004:)
      const match = summary.match(/\[(.*?)\]|([A-Z]{2,4}\s?\d{3,4})/i);
      if (match) {
        currentEvent.courseCode = match[1] || match[2];
      }
    } else if (line.startsWith("DTEND:") || line.startsWith("DTSTART:")) {
      const dateVal = line.split(":")[1];
      if (dateVal && !currentEvent.dueDate) {
        try {
          // Standard iCal format: 20260928T235900Z or 20260928
          if (dateVal.length >= 8) {
            const y = parseInt(dateVal.substring(0, 4), 10);
            const m = parseInt(dateVal.substring(4, 6), 10) - 1;
            const d = parseInt(dateVal.substring(6, 8), 10);
            let h = 23, min = 59;

            if (dateVal.includes("T")) {
              const timePart = dateVal.split("T")[1];
              h = parseInt(timePart.substring(0, 2), 10) || 23;
              min = parseInt(timePart.substring(2, 4), 10) || 59;
            }

            const parsedDate = new Date(Date.UTC(y, m, d, h, min));
            currentEvent.dueDate = parsedDate.toISOString();
          }
        } catch {
          currentEvent.dueDate = new Date(Date.now() + 86400000 * 3).toISOString();
        }
      }
    } else if (line.startsWith("DESCRIPTION:")) {
      currentEvent.description = line.replace("DESCRIPTION:", "").replace(/\\n/g, " ").trim();
    } else if (line.startsWith("URL:")) {
      currentEvent.submissionUrl = line.replace("URL:", "").trim();
    }
  }

  return events;
}

/**
 * Parses copied text directly from Google Classroom To-Do page (classroom.google.com/a)
 */
export function parseClassroomPastedText(rawText: string): Assignment[] {
  const assignments: Assignment[] = [];
  const lines = rawText.split(/\r\n|\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  let currentTitle = "";
  let currentCourse = "FAST-NU Course";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect Course names or headers
    if (
      line.includes("Computer") ||
      line.includes("Algorithms") ||
      line.includes("Architecture") ||
      line.includes("Networks") ||
      line.includes("Writing") ||
      line.includes("HCI") ||
      line.includes("BCS-5E") ||
      line.match(/CS\s?\d{4}/i)
    ) {
      currentCourse = line;
      continue;
    }

    // Detect Due dates (e.g. "Due Monday", "Due Sep 28", "Due tomorrow")
    if (line.toLowerCase().startsWith("due")) {
      const title = currentTitle || "Classroom Assignment";
      let hours = 72; // default 3 days
      if (line.toLowerCase().includes("today")) hours = 12;
      else if (line.toLowerCase().includes("tomorrow")) hours = 30;

      assignments.push({
        id: `paste-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        courseId: "c1",
        courseCode: currentCourse.substring(0, 10),
        courseName: currentCourse,
        title: title,
        description: `Imported from Google Classroom: ${line}`,
        dueDate: new Date(Date.now() + hours * 3600 * 1000).toISOString(),
        maxPoints: 25,
        status: "todo",
        type: title.toLowerCase().includes("quiz") ? "quiz" : "assignment",
        estimatedHours: 3,
      });

      currentTitle = "";
      continue;
    }

    // Likely an assignment title
    if (line.length > 4 && !line.startsWith("http")) {
      currentTitle = line;
    }
  }

  return assignments;
}
