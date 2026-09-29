import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { canonicalTemplateId, getTemplate, planSummary, templates, type WorkoutTemplate } from '../content'
import { formatDay, localISO } from '../lib/dates'
import { finishedSessions, sessionSummary, suggestedTemplateId } from '../lib/plan'
import { useStore } from '../store'
import type { ProgramId, Session, WeightUnit } from '../types'

function inPlan(id: string, programs: ProgramId[]) {
  return programs.includes(canonicalTemplateId(id) as ProgramId)
}

export function Train() {
  const { state, actions } = useStore()
  const today = localISO()
  const suggested = suggestedTemplateId(state, today)
  const recent = finishedSessions(state).slice(0, 8)
  const active = templates.filter((template) => inPlan(template.id, state.settings.activePrograms))
  const inactive = templates.filter((template) => !inPlan(template.id, state.settings.activePrograms))

  useEffect(() => {
    document.title = 'Train · 4HB Trainer'
  }, [])

  return (
    <div className="stack-lg">
      <header className="page-head">
        <p className="kicker">Sessions</p>
        <h1>Train</h1>
        <p className="lede">
          {planSummary(state.settings.objective, state.settings.activePrograms)} Any session can still be started on any day.
        </p>
      </header>
      {state.draft && (
        <div className="banner">
          <div>
            <strong>Unfinished session</strong>
            <p>{getTemplate(state.draft.templateId)?.name}</p>
          </div>
          <div className="row-gap">
            <Link className="btn btn-primary" to={`/train/${state.draft.templateId}`}>
              Resume
            </Link>
            <button className="btn btn-ghost" type="button" onClick={() => actions.discardDraft()}>
              Discard
            </button>
          </div>
        </div>
      )}
      <div className="protocol-grid">
        {active.map((template) => (
          <SessionCard key={template.id} template={template} suggested={suggested} recent={recent} draftId={state.draft?.templateId} unit={state.settings.weightUnit} />
        ))}
      </div>
      {inactive.length > 0 && (
        <section className="stack">
          <h2>Not in this plan</h2>
          <div className="protocol-grid">
            {inactive.map((template) => (
              <SessionCard key={template.id} template={template} suggested={suggested} recent={recent} draftId={state.draft?.templateId} unit={state.settings.weightUnit} />
            ))}
          </div>
        </section>
      )}
      <section className="card">
        <h3>Recent sessions</h3>
        {recent.length === 0 ? (
          <p>Finished sessions will land here.</p>
        ) : (
          <ul className="history">
            {recent.map((session) => (
              <li key={session.id}>
                <div>
                  <strong>{getTemplate(session.templateId)?.name}</strong>
                  <span>
                    {formatDay(session.date, { day: 'numeric', month: 'short' })} · {sessionSummary(session, state.settings.weightUnit)}
                  </span>
                </div>
                <button className="btn-text danger" type="button" onClick={() => actions.removeSession(session.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function SessionCard({
  template,
  suggested,
  recent,
  draftId,
  unit,
}: {
  template: WorkoutTemplate
  suggested: string | null
  recent: Session[]
  draftId?: string
  unit: WeightUnit
}) {
  const last = recent.find((session) => canonicalTemplateId(session.templateId) === template.id)
  const featured = suggested === template.id
  const resume = draftId != null && canonicalTemplateId(draftId) === template.id
  return (
    <article className={`card protocol${featured ? ' featured' : ''}`}>
      <p className="kicker">{featured ? 'Suggested today' : template.kicker}</p>
      <h2>{template.name}</h2>
      <p>{template.summary}</p>
      <p className="footnote">
        {template.minutes}
        {last ? ` · Last ${formatDay(last.date, { day: 'numeric', month: 'short' })} · ${sessionSummary(last, unit)}` : ' · Not logged yet'}
      </p>
      <Link className="btn btn-primary" to={resume ? `/train/${template.id}` : `/train/${template.id}?start=1`}>
        {resume ? 'Resume' : 'Start'}
      </Link>
    </article>
  )
}
