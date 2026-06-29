import Link from "next/link";
import { Card } from "@/components/Card";
import { Hero } from "@/components/Hero";
import { SiteShell } from "@/components/SiteShell";
import { lessons, publishedVideoLessonIds } from "@/data/lessons";

const modules = Array.from(
  lessons.reduce((map, lesson) => {
    const group = map.get(lesson.module) ?? [];
    group.push(lesson);
    map.set(lesson.module, group);
    return map;
  }, new Map<string, typeof lessons>())
);

export default function CoursePage() {
  return (
    <SiteShell active="Course">
      <Hero
        badge="Course System"
        title={
          <>
            Alle Lessons als <span className="gold">Datenstruktur</span>
          </>
        }
        text={`${lessons.length} Lessons sind zentral gepflegt. ${publishedVideoLessonIds.size} Vimeo-Videos sind aktuell freigeschaltet.`}
      />

      <section className="bp-grid">
        {modules.map(([module, moduleLessons]) => (
          <Card key={module} badge={`${moduleLessons.length} Lessons`} title={module} text="Strukturierte Kurssektion mit dynamischen Lesson-Links.">
            <div className="bp-list">
              {moduleLessons.map((lesson) => (
                <Link className="bp-list-item" key={lesson.id} href={`/lesson/${lesson.id}`}>
                  <span>
                    {lesson.id}. {lesson.title}
                  </span>
                  <span className={lesson.videoId ? "gold" : "bp-muted"}>{lesson.videoId ? "Video" : "Platzhalter"}</span>
                </Link>
              ))}
            </div>
          </Card>
        ))}
      </section>
    </SiteShell>
  );
}
