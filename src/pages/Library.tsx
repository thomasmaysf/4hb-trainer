import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { VideoPanel } from '../components/VideoPanel'
import { exercises, getExercise, mealPresets, templates } from '../content'
import { formatDay } from '../lib/dates'
import { lastWorkSet } from '../lib/plan'
import { formatWeight } from '../lib/units'
import { useStore } from '../store'

export function Library() {
  const { exerciseId } = useParams()
  useEffect(() => {
    document.title = exerciseId ? 'Movement · 4HB Trainer' : 'Library · 4HB Trainer'
  }, [exerciseId])

  if (exerciseId) return <ExercisePage id={exerciseId} />
  return <LibraryHome />
}

function LibraryHome() {
  return (
    <div className="stack-lg">
      <header className="page-head">
        <p className="kicker">Reference</p>
        <h1>Library</h1>
        <p className="lede">Form cues and videos for every movement. The plans themselves live on the Programs page.</p>
      </header>
      <article className="card stack">
        <h2>Programs</h2>
        <p>Slow-carb, swings, Occam’s Protocol, prehab, and the second strength day. Pick one plan from the objective.</p>
        <div className="row-gap">
          <Link className="btn btn-primary" to="/programs">
            Choose a plan
          </Link>
          <Link className="btn btn-ghost" to="/links">
            Chapter links
          </Link>
        </div>
      </article>
      <section className="stack">
        <h2>Movements</h2>
        <div className="catalog">
          {exercises.map((exercise) => (
            <Link key={exercise.id} className="card catalog-card" to={`/library/${exercise.id}`}>
              <p className="kicker">{exercise.pattern}</p>
              <h3>{exercise.name}</h3>
              <p>{exercise.videos.length} video{exercise.videos.length === 1 ? '' : 's'} and links</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="stack">
        <h2>Repeating meals</h2>
        <div className="catalog">
          {mealPresets.map((preset) => (
            <article key={preset.id} className="card">
              <h3>{preset.name}</h3>
              <p className="plate-line">
                <span>{preset.protein}</span>
                <span>{preset.legume}</span>
                <span>{preset.veg}</span>
              </p>
              <p>{preset.note}</p>
            </article>
          ))}
        </div>
      </section>
      <p className="footnote">
        4HB Trainer is an independent log. It is not affiliated with Timothy Ferriss or the publisher of The 4-Hour Body. The wording here is original. Videos and articles open on their own sites. Use the book when you want the author’s exact write-up.
      </p>
    </div>
  )
}

function ExercisePage({ id }: { id: string }) {
  const exercise = getExercise(id)
  const { state } = useStore()
  if (!exercise) {
    return (
      <div className="card">
        <p>That movement isn’t in the library.</p>
        <Link to="/library">Back to the library</Link>
      </div>
    )
  }
  const last = lastWorkSet(state, exercise.id)
  const usedBy = templates.filter((template) => template.exercises.some((item) => item.exerciseId === exercise.id))

  return (
    <div className="stack-lg">
      <Link to="/library">Library</Link>
      <header className="page-head">
        <p className="kicker">{exercise.pattern}</p>
        <h1>{exercise.name}</h1>
      </header>
      <div className="detail-grid">
        <VideoPanel videos={exercise.videos} />
        <div className="card stack">
          <h2>Reps</h2>
          {usedBy.map((template) => {
            const item = template.exercises.find((entry) => entry.exerciseId === exercise.id)
            return (
              <p key={template.id}>
                <Link to={`/train/${template.id}`}>{template.name}</Link>
                {item ? ` · ${item.prescription}` : ''}
              </p>
            )
          })}
          {last && (
            <p className="footnote">
              Last work set {formatDay(last.date, { day: 'numeric', month: 'short' })} · {formatWeight(last.set.weightKg, state.settings.weightUnit)} × {last.set.reps}
            </p>
          )}
          <h2>Cues</h2>
          <ul>
            {exercise.cues.map((cue) => (
              <li key={cue}>{cue}</li>
            ))}
          </ul>
          <h2>Tips</h2>
          <ul>
            {exercise.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
