import { notFound } from "next/navigation";
import { CtaLink } from "@/components/CtaLink";
import { Hero } from "@/components/Hero";
import { LessonPlayer } from "@/components/LessonPlayer";
import { SiteShell } from "@/components/SiteShell";
import { getAdjacentLesson, getLesson, lessons } from "@/data/lessons";

export function generateStaticParams() {
  return lessons.map((lesson) => ({ id: String(lesson.id) }));
}

type LessonPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;
  const lesson = getLesson(Number(id));

  if (!lesson) {
    notFound();
  }

  const adjacent = getAdjacentLesson(lesson.id);

  return (
    <SiteShell active="Course" eyebrow={lesson.module}>
      <Hero
        badge={`Lesson ${lesson.id}`}
        title={<>{lesson.title}</>}
        text={lesson.description}
        actions={
          <>
            {adjacent.previous ? (
              <CtaLink href={`/lesson/${adjacent.previous.id}`} variant="secondary">
                Vorherige Lesson
              </CtaLink>
            ) : null}
            {adjacent.next ? <CtaLink href={`/lesson/${adjacent.next.id}`}>Nächste Lesson</CtaLink> : null}
          </>
        }
      />

      <section className="bp-grid">
        <article className="bp-card wide">
          <LessonPlayer videoId={lesson.videoId} title={lesson.videoTitle ?? lesson.title} />
        </article>
        <aside className="bp-card">
          <div className="bp-badge small">Fokus</div>
          <h2>{lesson.focus}</h2>
          <p>Tags: {lesson.tags.join(" · ")}</p>
        </aside>
      </section>
    </SiteShell>
  );
}
