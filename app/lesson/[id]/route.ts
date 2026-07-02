import { type NextRequest, NextResponse } from "next/server";

type LessonRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: LessonRouteContext) {
  const { id } = await params;
  const lessonId = Number(id);

  if (!Number.isInteger(lessonId) || lessonId < 1 || lessonId > 33) {
    return NextResponse.redirect(new URL("/course", request.url), 302);
  }

  return NextResponse.redirect(new URL(`/lesson${lessonId}#lesson-video`, request.url), 308);
}
