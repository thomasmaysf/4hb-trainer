import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getTemplate, matchObjective, objectives, planSummary, programs, programsFor } from '../content'
import { WEEKDAYS } from '../lib/dates'
import { weekSchedule } from '../lib/plan'
import { useStore } from '../store'
import type { ObjectiveId, ProgramId } from '../types'

const weekOrder = [1, 2, 3, 4, 5, 6, 0]

export function Programs() {
  const { state, actions } = useStore()
  const dietOn = state.settings.activePrograms.includes('slow-carb')
  const schedule = weekSchedule(state.settings)

  useEffect(() => {
    document.title = 'Programs · 4HB Trainer'
  }, [])

  function choose(id: Exclude<ObjectiveId, 'custom'>) {
    actions.updateSettings({ objective: id, activePrograms: programsFor(id) })
  }

  function toggle(id: ProgramId) {
    const current = state.settings.activePrograms
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    const objective = matchObjective(next)
    actions.updateSettings({
      objective,
      activePrograms: objective === 'custom' ? next : programsFor(objective),
    })
  }

  return (
    <div className="stack-lg">
      <header className="page-head">
        <p className="kicker">Plans</p>
        <h1>Programs</h1>
        <p className="lede">Pick the objective. The week below is what Today will suggest. You can turn a single program on or off after that.</p>
      </header>
      <div className="objective-grid">
        {objectives.map((objective) => (
          <button
            key={objective.id}
            type="button"
            className={`selectable${state.settings.objective === objective.id ? ' active' : ''}`}
            aria-pressed={state.settings.objective === objective.id}
            onClick={() => choose(objective.id)}
          >
            <span className="kicker">{state.settings.objective === objective.id ? 'Following' : 'Objective'}</span>
            <strong>{objective.label}</strong>
            <p>{objective.detail}</p>
          </button>
        ))}
      </div>
      <section className="card stack">
        <div className="row-between">
          <h2>{state.settings.objective === 'custom' ? 'Custom week' : 'This week'}</h2>
          <span className="footnote">{planSummary(state.settings.objective, state.settings.activePrograms)}</span>
        </div>
        <div className="week">
          {weekOrder.map((day) => {
            const templateId = schedule[day]
            const template = templateId ? getTemplate(templateId) : undefined
            const off = dietOn && !template && day === state.settings.offDay
            return (
              <div key={day} className={`week-day${off ? ' is-off' : ''}`}>
                <span>{WEEKDAYS[day].slice(0, 1)}</span>
                <strong>{template ? (template.id === 'prehab' ? 'Prep' : 'Train') : off ? 'Off' : '—'}</strong>
                <small>{templateId === 'prehab' ? 'Prehab' : templateId === 'occam' ? 'Occam' : templateId === 'swings' ? 'Swings' : templateId === 'strength-b' ? 'Strength' : off ? 'Off day' : 'Rest'}</small>
              </div>
            )
          })}
        </div>
      </section>
      <section className="stack">
        <h2>Catalog</h2>
        <div className="catalog">
          {programs.map((program) => {
            const on = state.settings.activePrograms.includes(program.id)
            const destination = program.kind === 'diet' ? '/eat' : `/train/${program.id}`
            return (
              <article key={program.id} className={`card stack${on ? ' featured' : ''}`}>
                <p className="kicker">{on ? 'In this plan' : program.for}</p>
                <h3>{program.name}</h3>
                <p>{program.summary}</p>
                <p className="footnote">{program.when}</p>
                <div className="row-gap">
                  <button className={on ? 'btn btn-primary' : 'btn btn-ghost'} type="button" onClick={() => toggle(program.id)} aria-pressed={on}>
                    {on ? 'Following' : 'Add'}
                  </button>
                  <Link className="btn btn-ghost" to={destination}>
                    {program.kind === 'diet' ? 'Open plate' : 'Open session'}
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>
      <p className="footnote">
        These are original logging plans for the slow-carb plate, the swing dose, Occam’s Protocol, a short prehab session, and a second strength day. They are not the book’s text, and this app is not affiliated with the author. Use the book for his exact write-up. The <Link to="/links">Links</Link> page lists the web addresses printed in each chapter.
      </p>
    </div>
  )
}
