type LessonPlayerProps = {
  videoId?: string;
  title: string;
};

export function LessonPlayer({ videoId, title }: LessonPlayerProps) {
  if (!videoId) {
    return (
      <div className="bp-video-placeholder">
        <div className="bp-video-icon">Video folgt</div>
        <strong>Lesson Video wird bald freigeschaltet</strong>
        <span>Der Platzhalter bleibt sauber sichtbar, bis das Vimeo-Video hinterlegt ist.</span>
      </div>
    );
  }

  const src = `https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479`;

  return (
    <div className="bp-video">
      <iframe
        src={src}
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        title={title}
      />
    </div>
  );
}
