import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Chart } from '../components/Chart'
import { canonicalTemplateId, getTemplate, mealSlots, planSummary } from '../content'
import { addDays, formatDay, localISO, startOfWeek, weekdayIndex, WEEKDAYS } from '../lib/dates'
import { dayStatus, finishedToday, latestDelta, nextTraining, sessionSummary, suggestedTemplateId, swingReps } from '../lib/plan'
import { formatLength, formatSigned, formatWeight, lengthToDisplay, weightToDisplay } from '../lib/units'
import { useStore } from '../store'

export function Today() {
  const { state } = useStore()
  const today = localISO()
  const suggestedId = suggestedTemplateId(state, today)
  const upcoming = nextTraining(state, today)
  const loggedToday = state.sessions.filter((session) => session.finishedAt && session.date === today)
  const template = state.draft ? getTemplate(state.draft.templateId) : suggestedId ? getTemplate(suggestedId) : upcoming ? getTemplate(upcoming.templateId) : undefined
  const day = state.days.find((item) => item.date === today)
  const dietOn = state.settings.activePrograms.includes('slow-carb')
  const onPlate = day?.meals.filter((meal) => meal.onPlate).length ?? 0
  const measurements = [...state.measurements].sort((a, b) => a.date.localeCompare(b.date))
  const latest = measurements[measurements.length - 1]
  const weightDelta = latestDelta(state.measurements, 'weightKg')
  const weekStart = startOfWeek(today)
  const week = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))

  useEffect(() => {
    document.title = 'Today · 4HB Trainer'
  }, [])

  let heroKicker = 'Today'
  let heroTitle = 'Rest'
  let heroBody = 'Nothing is scheduled. You can still start a session from Train.'
  let heroAction: { to: string; label: string } | null = { to: '/train', label: 'Browse sessions' }

  if (state.draft && template) {
    heroKicker = 'In progress'
    heroTitle = template.name
    heroBody = 'This session is still open. The sets you already logged are saved in this browser.'
    heroAction = { to: `/train/${template.id}`, label: 'Resume' }
  } else if (suggestedId && finishedToday(state, today, suggestedId)) {
    const logged = state.sessions.find((session) => session.finishedAt && session.date === today && canonicalTemplateId(session.templateId) === canonicalTemplateId(suggestedId))
    heroKicker = 'Logged'
    heroTitle = getTemplate(suggestedId)?.name ?? 'Session'
    heroBody = logged ? sessionSummary(logged, state.settings.weightUnit) : 'Saved for today.'
    heroAction = null
  } else if (suggestedId && template) {
    heroKicker = `${formatDay(today, { weekday: 'long' })} · ${template.kicker}`
    heroTitle = template.name
    heroBody = template.summary
    heroAction = { to: `/train/${template.id}?start=1`, label: 'Start session' }
  } else if (!suggestedId && loggedToday.length > 0) {
    const logged = loggedToday[loggedToday.length - 1]
    heroKicker = 'Logged today'
    heroTitle = getTemplate(logged.templateId)?.name ?? 'Session'
    heroBody = upcoming
      ? `${sessionSummary(logged, state.settings.weightUnit)}. Next is ${formatDay(upcoming.date, { weekday: 'long' })}.`
      : sessionSummary(logged, state.settings.weightUnit)
    heroAction = null
  } else if (upcoming && template) {
    heroKicker = 'Next session'
    heroTitle = formatDay(upcoming.date, { weekday: 'long' })
    heroBody = `${template.name}. ${template.summary}`
    heroAction = { to: `/train/${upcoming.templateId}?start=1`, label: 'Start early' }
  }

  return (
    <div className="stack-lg">
      <header className="page-head">
        <p className="kicker">{formatDay(today)}</p>
        <h1>Today</h1>
        <p className="lede">
          {planSummary(state.settings.objective, state.settings.activePrograms)} <Link to="/programs">Change plan</Link>
        </p>
      </header>
      <div className="today-grid">
        <article className="hero">
          <p className="kicker">{heroKicker}</p>
          <h2>{heroTitle}</h2>
          <p>{heroBody}</p>
          {heroAction && (
            <Link className="btn btn-primary" to={heroAction.to}>
              {heroAction.label}
            </Link>
          )}
        </article>
        <div className="stack">
          <section className="card">
            <div className="row-between">
              <h3>This week</h3>
              <Link to="/eat">Meals</Link>
            </div>
            <div className="week">
              {week.map((iso) => {
                const status = dayStatus(state, iso)
                const plannedOff = dietOn && (status === 'off' || (status === 'empty' && weekdayIndex(iso) === state.settings.offDay))
                const planned = suggestedTemplateId(state, iso)
                const done = state.sessions.some((session) => session.finishedAt && session.date === iso)
                return (
                  <Link
                    key={iso}
                    to={`/eat?date=${iso}`}
                    className={`week-day${iso === today ? ' is-today' : ''}${plannedOff ? ' is-off' : ''}${done ? ' is-done' : ''}`}
                    title={WEEKDAYS[weekdayIndex(iso)]}
                  >
                    <span>{formatDay(iso, { weekday: 'narrow' })}</span>
                    <strong>{formatDay(iso, { day: 'numeric' })}</strong>
                    <small>{done ? 'Done' : planned === 'prehab' ? 'Prep' : planned ? 'Train' : plannedOff ? 'Off' : ''}</small>
                  </Link>
                )
              })}
            </div>
          </section>
          <section className="card">
            <div className="row-between">
              <h3>{!dietOn ? 'Plate off' : day?.offDay ? 'Off day' : 'Plate'}</h3>
              <Link to={dietOn ? `/eat?date=${today}` : '/programs'}>{dietOn ? 'Log food' : 'Plans'}</Link>
            </div>
            {!dietOn ? (
              <p>Slow-carb is not part of this plan. Turn it on from Programs if you want the plate scored.</p>
            ) : day?.offDay ? (
              <p>Today is the free day. Meals you note here are not scored.</p>
            ) : (
              <div className="stats">
                <div className="stat">
                  <strong>{day?.meals.length ?? 0}</strong>
                  <span>meals</span>
                </div>
                <div className="stat">
                  <strong>{onPlate}</strong>
                  <span>on the plate</span>
                </div>
                <div className="stat">
                  <strong>{day?.water ?? 0}</strong>
                  <span>glasses</span>
                </div>
              </div>
            )}
            <p className="plate-line">
              <span>Protein</span>
              <span>Legumes</span>
              <span>Vegetables</span>
            </p>
            {day && day.meals.length > 0 && (
              <ul className="plain-list">
                {mealSlots.map((slot) => {
                  const meal = day.meals.find((item) => item.slot === slot.id)
                  if (!meal) return null
                  return (
                    <li key={slot.id}>
                      {slot.label}: {meal.label}
                      {!day.offDay && !meal.onPlate ? ' · off the plate' : ''}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
          <section className="card">
            <div className="row-between">
              <h3>Body</h3>
              <Link to="/progress">Add entry</Link>
            </div>
            {latest ? (
              <>
                <div className="stats">
                  <div className="stat">
                    <strong>{latest.weightKg != null ? formatWeight(latest.weightKg, state.settings.weightUnit) : '—'}</strong>
                    <span>weight</span>
                  </div>
                  <div className="stat">
                    <strong>{latest.waistCm != null ? formatLength(latest.waistCm, state.settings.lengthUnit) : '—'}</strong>
                    <span>waist</span>
                  </div>
                  <div className="stat">
                    <strong>{weightDelta ? formatSigned(weightToDisplay(weightDelta.delta, state.settings.weightUnit)) : '—'}</strong>
                    <span>since last</span>
                  </div>
                </div>
                {measurements.filter((item) => item.weightKg != null).length > 1 && (
                  <Chart
                    label="Body weight"
                    unit={state.settings.weightUnit}
                    color="#d4532b"
                    points={measurements
                      .filter((item) => item.weightKg != null)
                      .map((item) => ({ date: item.date, value: weightToDisplay(item.weightKg as number, state.settings.weightUnit) }))}
                  />
                )}
              </>
            ) : (
              <p>No weigh-in yet. A weekly waist measurement is the number to trust.</p>
            )}
            {latest?.waistCm != null && (
              <p className="footnote">
                Waist {formatLength(latest.waistCm, state.settings.lengthUnit)}
                {latestDelta(state.measurements, 'waistCm')
                  ? ` · ${formatSigned(lengthToDisplay(latestDelta(state.measurements, 'waistCm')!.delta, state.settings.lengthUnit))} ${state.settings.lengthUnit} since the entry before`
                  : ''}
              </p>
            )}
          </section>
        </div>
      </div>
      {state.draft && state.draft.templateId === 'swings' && (
        <p className="footnote">{swingReps(state.draft.sets)} swings logged in the open session.</p>
      )}
    </div>
  )
}
