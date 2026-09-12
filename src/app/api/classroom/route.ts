import { NextResponse } from "next/server";
import { mockCourses, getMockAssignments, mockTimetableSlots, mockUser } from "@/data/mockClassroom";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get("token");

  // If a real Google OAuth token is provided, we can fetch real Google Classroom data
  if (accessToken) {
    try {
      // 1. Fetch courses
      const coursesRes = await fetch("https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        return NextResponse.json({
          source: "google_classroom_live",
          courses: coursesData.courses || [],
          message: "Synced with live Google Classroom API successfully.",
        });
      }
    } catch (err: any) {
      console.error("Failed to query Google Classroom API:", err);
    }
  }

  // Default / Mock Data response for instant demonstration
  return NextResponse.json({
    source: "demo_curriculum",
    user: mockUser,
    courses: mockCourses,
    assignments: getMockAssignments(),
    timetable: mockTimetableSlots,
    message: "Using university demonstration dataset.",
  });
}
