import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { mealPresets, mealSlots, plate, presetLabel, rules } from '../content'
import { addDays, formatDay, localISO, weekdayIndex } from '../lib/dates'
import { uid } from '../lib/id'
import { useStore } from '../store'
import type { DayLog, MealSlot } from '../types'

export function Eat() {
  const { state, actions } = useStore()
  const [params, setParams] = useSearchParams()
  const date = params.get('date') || localISO()
  const saved = state.days.find((day) => day.date === date)
  const dietOn = state.settings.activePrograms.includes('slow-carb')
  const [custom, setCustom] = useState<Record<MealSlot, string>>({ breakfast: '', lunch: '', dinner: '', extra: '' })
  const [rulesOpen, setRulesOpen] = useState(false)

  useEffect(() => {
    document.title = 'Eat · 4HB Trainer'
  }, [])

  function base(): DayLog {
    return (
      saved ?? {
        date,
        offDay: dietOn && weekdayIndex(date) === state.settings.offDay,
        meals: [],
        water: 0,
        note: '',
      }
    )
  }

  function write(next: DayLog) {
    actions.saveDay(next)
  }

  function setMeal(slot: MealSlot, label: string) {
    const day = base()
    write({
      ...day,
      meals: [...day.meals.filter((meal) => meal.slot !== slot), { id: uid(), slot, label, onPlate: true }],
    })
  }

  const day = base()

  return (
    <div className="stack-lg">
      <header className="page-head">
        <p className="kicker">Slow-carb plate</p>
        <h1>Eat</h1>
        <p className="lede">
          {dietOn
            ? 'Protein, legumes, and vegetables on protocol days. One weekday is free and is not scored.'
            : 'The slow-carb plate is off in the current plan. Meals you add here are notes.'}
        </p>
        <p className="footnote">
          <Link to="/links?chapter=the-slow-carb-diet-i">Slow-carb chapter links</Link>
        </p>
      </header>
      {!dietOn && (
        <p className="banner">
          Slow-carb is not part of this plan. <Link to="/programs">Choose a plan</Link> if you want it scored.
        </p>
      )}
      <div className="eat-layout">
        <div className="stack">
          <div className="card stack">
            <div className="row-between">
              <button className="btn btn-ghost" type="button" onClick={() => setParams({ date: addDays(date, -1) })}>
                Previous
              </button>
              <label className="field date-field">
                <span className="sr">Date</span>
                <input type="date" value={date} onChange={(event) => setParams({ date: event.target.value })} />
              </label>
              <button className="btn btn-ghost" type="button" onClick={() => setParams({ date: addDays(date, 1) })}>
                Next
              </button>
            </div>
            <p className="footnote">{formatDay(date)}</p>
            <label className="check">
              <input
                type="checkbox"
                checked={day.offDay}
                onChange={(event) => write({ ...day, offDay: event.target.checked })}
              />
              <span>Off day. Meals logged here are notes, not slips.</span>
            </label>
            {day.offDay && <p className="banner banner-off">Free day. Eat what you planned to eat.</p>}
          </div>
          {mealSlots.map((slot) => {
            const meal = day.meals.find((item) => item.slot === slot.id)
            return (
              <section key={slot.id} className="card stack">
                <h2>{slot.label}</h2>
                {meal ? (
                  <>
                    <p>{meal.label}</p>
                    {!day.offDay && (
                      <label className="check">
                        <input
                          type="checkbox"
                          checked={meal.onPlate}
                          onChange={(event) =>
                            write({
                              ...day,
                              meals: day.meals.map((item) => (item.id === meal.id ? { ...item, onPlate: event.target.checked } : item)),
                            })
                          }
                        />
                        <span>On the plate</span>
                      </label>
                    )}
                    <button
                      className="btn-text"
                      type="button"
                      onClick={() => write({ ...day, meals: day.meals.filter((item) => item.id !== meal.id) })}
                    >
                      Clear
                    </button>
                  </>
                ) : (
                  <>
                    <div className="chips">
                      {mealPresets.map((preset) => (
                        <button key={preset.id} className="chip" type="button" onClick={() => setMeal(slot.id, presetLabel(preset))}>
                          {preset.name}
                        </button>
                      ))}
                    </div>
                    <div className="row-gap">
                      <input
                        value={custom[slot.id]}
                        placeholder="Or type a plate"
                        onChange={(event) => setCustom((current) => ({ ...current, [slot.id]: event.target.value }))}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && custom[slot.id].trim()) {
                            setMeal(slot.id, custom[slot.id].trim())
                            setCustom((current) => ({ ...current, [slot.id]: '' }))
                          }
                        }}
                      />
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => {
                          if (!custom[slot.id].trim()) return
                          setMeal(slot.id, custom[slot.id].trim())
                          setCustom((current) => ({ ...current, [slot.id]: '' }))
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </>
                )}
              </section>
            )
          })}
          <section className="card stack">
            <div className="row-between">
              <h2>Water</h2>
              <strong>{day.water} glasses</strong>
            </div>
            <div className="row-gap">
              <button className="btn btn-ghost" type="button" onClick={() => write({ ...day, water: Math.max(0, day.water - 1) })}>
                −1
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => write({ ...day, water: day.water + 1 })}>
                +1
              </button>
            </div>
            <label className="field">
              <span>Note</span>
              <textarea value={day.note} onChange={(event) => write({ ...day, note: event.target.value })} />
            </label>
          </section>
        </div>
        <aside className="stack">
          <section className="card stack">
            <button className="btn-text rules-toggle" type="button" onClick={() => setRulesOpen((open) => !open)}>
              {rulesOpen ? 'Hide the rules' : 'Show the five rules'}
            </button>
            <div className={rulesOpen ? 'stack' : 'rules-desktop stack'}>
              {rules.map((rule) => (
                <div key={rule.title}>
                  <h3>{rule.title}</h3>
                  <p>{rule.body}</p>
                </div>
              ))}
              <h3>On the plate</h3>
              <p>
                <strong>Protein. </strong>
                {plate.proteins.join(', ')}.
              </p>
              <p>
                <strong>Legumes. </strong>
                {plate.legumes.join(', ')}.
              </p>
              <p>
                <strong>Vegetables. </strong>
                {plate.vegetables.join(', ')}.
              </p>
            </div>
          </section>
          <section className="card stack">
            <h3>Repeating meals</h3>
            {mealPresets.map((preset) => (
              <p key={preset.id}>
                <strong>{preset.name}. </strong>
                {preset.note}
              </p>
            ))}
          </section>
        </aside>
      </div>
    </div>
  )
}
