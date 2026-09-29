import type { VideoRef } from '../content'
import { useState } from 'react'

export function VideoPanel({ videos }: { videos: VideoRef[] }) {
  const [playing, setPlaying] = useState<string | null>(null)

  return (
    <div className="videos">
      {videos.map((video) =>
        video.embedId ? (
          <article key={video.id} className="video-card">
            {playing === video.embedId ? (
              <iframe
                className="video-frame"
                src={`https://www.youtube.com/embed/${video.embedId}?autoplay=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button className="video-poster" type="button" onClick={() => setPlaying(video.embedId ?? null)}>
                <img src={`https://i.ytimg.com/vi/${video.embedId}/hqdefault.jpg`} alt="" />
                <span>Play</span>
              </button>
            )}
            <a className="resource" href={video.url} target="_blank" rel="noreferrer">
              <span>{video.title}</span>
              <small>{video.by}</small>
            </a>
          </article>
        ) : (
          <a key={video.id} className="resource" href={video.url} target="_blank" rel="noreferrer">
            <span>{video.title}</span>
            <small>{video.by}</small>
          </a>
        ),
      )}
    </div>
  )
}
