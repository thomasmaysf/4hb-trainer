import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { VideoPanel } from '../components/VideoPanel'
import { canonicalTemplateId, getExercise, getTemplate, type Exercise, type WorkoutTemplate } from '../content'
import { formatDay } from '../lib/dates'
import { lastWorkSet, swingReps } from '../lib/plan'
import { formatWeight, trimNumber, weightToDisplay, weightToKg } from '../lib/units'
import { useStore } from '../store'
import type { Session as SessionLog } from '../types'

export function Session() {
  const { templateId = '' } = useParams()
  const template = getTemplate(templateId)
  const [params] = useSearchParams()
  const start = params.get('start')
  const { state, actions } = useStore()
  const [activeId, setActiveId] = useState(template?.exercises[0]?.exerciseId ?? '')

  useEffect(() => {
    document.title = template ? `${template.name} · 4HB Trainer` : 'Train · 4HB Trainer'
  }, [template])

  useEffect(() => {
    if (start !== '1' || !template) return
    actions.startDraft(template.id)
  }, [actions, start, template])

  if (!template) {
    return (
      <div className="card">
        <p>That session isn’t in the library.</p>
        <Link to="/train">Back to Train</Link>
      </div>
    )
  }

  if (state.draft && canonicalTemplateId(state.draft.templateId) !== template.id) {
    const other = getTemplate(state.draft.templateId)
    return (
      <div className="card stack">
        <h1>A session is already open</h1>
        <p>{other?.name ?? 'Another session'} still has unsaved sets in this browser.</p>
        <div className="row-gap">
          <Link className="btn btn-primary" to={`/train/${state.draft.templateId}`}>
            Resume it
          </Link>
          <button className="btn btn-ghost" type="button" onClick={() => actions.discardDraft()}>
            Discard it
          </button>
        </div>
      </div>
    )
  }

  const started = state.draft != null && canonicalTemplateId(state.draft.templateId) === template.id
  const active = getExercise(activeId) ?? getExercise(template.exercises[0].exerciseId)

  return (
    <div className="stack-lg">
      <header className="page-head">
        <p className="kicker">{template.kicker}</p>
        <h1>{template.name}</h1>
        <p className="lede">{template.summary}</p>
      </header>
      <div className="session-layout">
        <section className="session-media card">
          {active && (
            <>
              <VideoPanel key={active.id} videos={active.videos} />
              <Cues exercise={active} />
            </>
          )}
        </section>
        <section className="session-log stack">
          {started && state.draft ? (
            template.id === 'swings' ? (
              <SwingLogger template={template} draft={state.draft} onActivate={setActiveId} />
            ) : (
              <StrengthLogger template={template} draft={state.draft} activeId={activeId} onActivate={setActiveId} />
            )
          ) : (
            <Briefing template={template} onActivate={setActiveId} onBegin={() => actions.startDraft(template.id)} />
          )}
        </section>
      </div>
      {chapterLinks[template.id] && (
        <p className="footnote">
          <Link to={`/links?chapter=${chapterLinks[template.id]}`}>Addresses printed in this chapter</Link>
        </p>
      )}
    </div>
  )
}

const chapterLinks: Record<string, string> = {
  swings: 'building-the-perfect-posterior',
  occam: 'occam-s-protocol-i',
  prehab: 'pre-hab',
}

function Cues({ exercise }: { exercise: Exercise }) {
  return (
    <div className="cues">
      <h2>{exercise.name}</h2>
      <p className="footnote">{exercise.pattern}</p>
      <ul>
        {exercise.cues.map((cue) => (
          <li key={cue}>{cue}</li>
        ))}
      </ul>
      <h3>Tips</h3>
      <ul>
        {exercise.tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </div>
  )
}

function Briefing({ template, onActivate, onBegin }: { template: WorkoutTemplate; onActivate: (id: string) => void; onBegin: () => void }) {
  return (
    <div className="card stack">
      <h2>Before you start</h2>
      {template.exercises.map((item) => {
        const exercise = getExercise(item.exerciseId)
        if (!exercise) return null
        return (
          <button key={item.exerciseId} className="choice" type="button" onClick={() => onActivate(item.exerciseId)}>
            <span>
              {item.role}
              {item.optional ? ' · optional' : ''}
            </span>
            <strong>{exercise.name}</strong>
            <small>{item.prescription}</small>
          </button>
        )
      })}
      <button className="btn btn-primary" type="button" onClick={onBegin}>
        Begin session
      </button>
    </div>
  )
}

function SwingLogger({ template, draft, onActivate }: { template: WorkoutTemplate; draft: SessionLog; onActivate: (id: string) => void }) {
  const { state, actions } = useStore()
  const navigate = useNavigate()
  const target = state.settings.swingTarget
  const total = swingReps(draft.sets)
  const [bell, setBell] = useState(() => trimNumber(weightToDisplay(state.settings.bellKg, state.settings.weightUnit)))
  const [custom, setCustom] = useState('20')
  const [armed, setArmed] = useState(false)
  const swing = template.exercises[0]
  const getup = template.exercises[1]

  function addSwing(reps: number) {
    const kg = weightToKg(Number(bell), state.settings.weightUnit)
    if (!Number.isFinite(reps) || reps <= 0 || !Number.isFinite(kg) || kg < 0) return
    actions.logSet({ exerciseId: 'swing', kind: 'work', reps: Math.round(reps), weightKg: kg })
  }

  const swingSets = draft.sets.filter((set) => set.exerciseId === 'swing')

  return (
    <>
      <div className="card stack">
        <button className="choice" type="button" onClick={() => onActivate('swing')}>
          <span>{swing.role}</span>
          <strong>Show swing video and cues</strong>
          <small>{swing.prescription}</small>
        </button>
        <div className="ring-wrap" aria-live="polite">
          <Ring value={total} max={target} />
          <div>
            <strong>{total}</strong>
            <span>of {target}</span>
          </div>
        </div>
        {total > target && <p>Past the starting dose. Save it and stop while the reps still match.</p>}
        <label className="field">
          <span>Bell ({state.settings.weightUnit})</span>
          <input value={bell} inputMode="decimal" onChange={(event) => setBell(event.target.value)} />
        </label>
        <div className="rep-grid">
          {[10, 15, 20, 25].map((reps) => (
            <button key={reps} className="btn btn-ghost" type="button" onClick={() => addSwing(reps)}>
              +{reps}
            </button>
          ))}
        </div>
        <div className="row-gap">
          <label className="field grow">
            <span>Custom reps</span>
            <input value={custom} inputMode="numeric" onChange={(event) => setCustom(event.target.value)} />
          </label>
          <button className="btn btn-primary" type="button" onClick={() => addSwing(Number(custom))}>
            Add set
          </button>
        </div>
        <SetList sets={swingSets.map((set) => ({ id: set.id, label: `${set.reps} reps · ${formatWeight(set.weightKg, state.settings.weightUnit)}` }))} />
      </div>
      {getup && <OptionalGetup prescription={getup.prescription} onActivate={onActivate} sets={draft.sets.filter((set) => set.exerciseId === 'getup')} />}
      <FinishBar
        note={draft.note}
        canFinish={draft.sets.length > 0}
        armed={armed}
        onArm={() => setArmed(true)}
        onDiscard={() => {
          actions.discardDraft()
          navigate('/train')
        }}
        onNote={actions.setDraftNote}
        onFinish={() => {
          actions.finishDraft()
          navigate('/')
        }}
      />
    </>
  )
}

function OptionalGetup({
  prescription,
  onActivate,
  sets,
}: {
  prescription: string
  onActivate: (id: string) => void
  sets: SessionLog['sets']
}) {
  const { state, actions } = useStore()
  const [reps, setReps] = useState('3')
  const [weight, setWeight] = useState(() => trimNumber(weightToDisplay(state.settings.bellKg, state.settings.weightUnit)))

  return (
    <div className="card stack">
      <button className="choice" type="button" onClick={() => onActivate('getup')}>
        <span>Optional</span>
        <strong>Turkish get-up</strong>
        <small>{prescription}</small>
      </button>
      <div className="form-grid">
        <label className="field">
          <span>Reps this side</span>
          <input value={reps} inputMode="numeric" onChange={(event) => setReps(event.target.value)} />
        </label>
        <label className="field">
          <span>Bell ({state.settings.weightUnit})</span>
          <input value={weight} inputMode="decimal" onChange={(event) => setWeight(event.target.value)} />
        </label>
      </div>
      <button
        className="btn btn-ghost"
        type="button"
        onClick={() => {
          const count = Math.round(Number(reps))
          const kg = weightToKg(Number(weight), state.settings.weightUnit)
          if (!Number.isFinite(count) || count <= 0 || !Number.isFinite(kg) || kg < 0) return
          actions.logSet({ exerciseId: 'getup', kind: 'work', reps: count, weightKg: kg })
        }}
      >
        Log this side
      </button>
      <SetList sets={sets.map((set) => ({ id: set.id, label: `${set.reps} reps · ${formatWeight(set.weightKg, state.settings.weightUnit)}` }))} />
    </div>
  )
}

function StrengthLogger({
  template,
  draft,
  activeId,
  onActivate,
}: {
  template: WorkoutTemplate
  draft: SessionLog
  activeId: string
  onActivate: (id: string) => void
}) {
  const { actions } = useStore()
  const navigate = useNavigate()
  const [armed, setArmed] = useState(false)

  return (
    <>
      {template.exercises.map((item) => {
        const exercise = getExercise(item.exerciseId)
        if (!exercise) return null
        return (
          <LiftCard
            key={item.exerciseId}
            exercise={exercise}
            role={item.role}
            prescription={item.prescription}
            bodyweight={item.bodyweight}
            countLabel={item.countLabel ?? 'Reps'}
            active={activeId === item.exerciseId}
            sets={draft.sets.filter((set) => set.exerciseId === item.exerciseId)}
            onActivate={() => onActivate(item.exerciseId)}
          />
        )
      })}
      <FinishBar
        note={draft.note}
        canFinish={draft.sets.length > 0}
        armed={armed}
        onArm={() => setArmed(true)}
        onDiscard={() => {
          actions.discardDraft()
          navigate('/train')
        }}
        onNote={actions.setDraftNote}
        onFinish={() => {
          actions.finishDraft()
          navigate('/')
        }}
      />
    </>
  )
}

function LiftCard({
  exercise,
  role,
  prescription,
  bodyweight = false,
  countLabel,
  active,
  sets,
  onActivate,
}: {
  exercise: Exercise
  role: string
  prescription: string
  bodyweight?: boolean
  countLabel: string
  active: boolean
  sets: SessionLog['sets']
  onActivate: () => void
}) {
  const { state, actions } = useStore()
  const last = lastWorkSet(state, exercise.id)
  const [weight, setWeight] = useState(() => (last ? trimNumber(weightToDisplay(last.set.weightKg, state.settings.weightUnit)) : ''))
  const [reps, setReps] = useState('')
  const [error, setError] = useState('')

  function formatLogged(set: SessionLog['sets'][number]) {
    const amount = `${set.reps} ${countLabel === 'Seconds' ? 'sec' : 'reps'}`
    const name = set.kind === 'work' ? 'Work' : 'Warm-up'
    if (bodyweight || set.weightKg === 0) return `${name} · ${amount}`
    return `${name} · ${formatWeight(set.weightKg, state.settings.weightUnit)} × ${set.reps}`
  }

  function log(kind: 'warmup' | 'work') {
    const count = Math.round(Number(reps))
    const kg = bodyweight ? 0 : weightToKg(Number(weight), state.settings.weightUnit)
    if (!Number.isFinite(count) || count <= 0) {
      setError(countLabel === 'Seconds' ? 'Enter the seconds.' : 'Enter the reps.')
      return
    }
    if (!Number.isFinite(kg) || kg < 0) {
      setError('Enter the weight. Use 0 for a bodyweight set.')
      return
    }
    actions.logSet({ exerciseId: exercise.id, kind, reps: count, weightKg: kg })
    setError('')
  }

  return (
    <article className={`card stack lift${active ? ' active' : ''}`}>
      <button className="choice" type="button" onClick={onActivate}>
        <span>{role}</span>
        <strong>{exercise.name}</strong>
        <small>{prescription}</small>
      </button>
      {last && !bodyweight && last.set.weightKg > 0 && (
        <p className="footnote">
          Last work set {formatDay(last.date, { day: 'numeric', month: 'short' })} · {formatWeight(last.set.weightKg, state.settings.weightUnit)} × {last.set.reps}
        </p>
      )}
      {!bodyweight && <TempoGuide />}
      <div className="form-grid">
        {!bodyweight && (
          <label className="field">
            <span>Weight ({state.settings.weightUnit})</span>
            <input value={weight} inputMode="decimal" onChange={(event) => setWeight(event.target.value)} />
          </label>
        )}
        <label className="field">
          <span>{countLabel}</span>
          <input value={reps} inputMode="numeric" onChange={(event) => setReps(event.target.value)} />
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="row-gap">
        {!bodyweight && (
          <button className="btn btn-ghost" type="button" onClick={() => log('warmup')}>
            Log warm-up
          </button>
        )}
        <button className="btn btn-primary" type="button" onClick={() => log('work')}>
          {bodyweight ? 'Log set' : 'Log work set'}
        </button>
      </div>
      <SetList sets={sets.map((set) => ({ id: set.id, label: formatLogged(set) }))} />
    </article>
  )
}

function TempoGuide() {
  const [phase, setPhase] = useState<'idle' | 'down' | 'up'>('idle')
  const [count, setCount] = useState(5)

  useEffect(() => {
    if (phase === 'idle') return
    const timer = window.setTimeout(() => {
      if (count > 1) {
        setCount(count - 1)
        return
      }
      if (phase === 'down') {
        setPhase('up')
        setCount(5)
        return
      }
      setPhase('idle')
      setCount(5)
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [phase, count])

  return (
    <div className="tempo-row">
      <button
        className="btn btn-ghost"
        type="button"
        disabled={phase !== 'idle'}
        onClick={() => {
          setPhase('down')
          setCount(5)
        }}
      >
        Count a 5–5 rep
      </button>
      {phase !== 'idle' && (
        <p className="tempo" aria-live="polite">
          <span>{phase === 'down' ? 'Lower' : 'Lift'}</span>
          <strong>{count}</strong>
        </p>
      )}
    </div>
  )
}

function SetList({ sets }: { sets: { id: string; label: string }[] }) {
  const { actions } = useStore()
  if (sets.length === 0) return null
  return (
    <ul className="history">
      {sets.map((set) => (
        <li key={set.id}>
          <span>{set.label}</span>
          <button className="btn-text" type="button" onClick={() => actions.removeSet(set.id)}>
            Remove
          </button>
        </li>
      ))}
    </ul>
  )
}

function FinishBar({
  note,
  canFinish,
  armed,
  onArm,
  onDiscard,
  onNote,
  onFinish,
}: {
  note: string
  canFinish: boolean
  armed: boolean
  onArm: () => void
  onDiscard: () => void
  onNote: (note: string) => void
  onFinish: () => void
}) {
  return (
    <div className="card stack">
      <label className="field">
        <span>Session note</span>
        <textarea value={note} onChange={(event) => onNote(event.target.value)} placeholder="Optional. How the reps looked." />
      </label>
      {!canFinish && <p className="footnote">Log at least one set to save the session.</p>}
      <div className="row-gap">
        <button className="btn btn-primary" type="button" disabled={!canFinish} onClick={onFinish}>
          Finish session
        </button>
        {armed ? (
          <button className="btn-text danger" type="button" onClick={onDiscard}>
            Discard this session
          </button>
        ) : (
          <button className="btn-text" type="button" onClick={onArm}>
            Discard
          </button>
        )}
      </div>
    </div>
  )
}

function Ring({ value, max }: { value: number; max: number }) {
  const radius = 52
  const circ = 2 * Math.PI * radius
  const pct = max <= 0 ? 0 : Math.min(1, value / max)
  return (
    <svg className="ring" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r={radius} className="ring-track" />
      {pct > 0 && <circle cx="60" cy="60" r={radius} className="ring-value" strokeDasharray={`${circ * pct} ${circ}`} />}
    </svg>
  )
}
