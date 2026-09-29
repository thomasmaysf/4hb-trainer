import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Chart } from '../components/Chart'
import { addDays, formatDay, localISO, weekdayIndex } from '../lib/dates'
import { dayStatus, latestDelta } from '../lib/plan'
import { formatLength, formatSigned, formatWeight, lengthToCm, lengthToDisplay, trimNumber, weightToDisplay, weightToKg } from '../lib/units'
import { useStore } from '../store'

export function Progress() {
  const { state, actions } = useStore()
  const today = localISO()
  const days = Array.from({ length: 28 }, (_, index) => addDays(today, index - 27))
  const measurements = [...state.measurements].sort((a, b) => a.date.localeCompare(b.date))
  const { weightUnit, lengthUnit } = state.settings

  useEffect(() => {
    document.title = 'Progress · 4HB Trainer'
  }, [])

  return (
    <div className="stack-lg">
      <header className="page-head">
        <p className="kicker">Log</p>
        <h1>Progress</h1>
        <p className="lede">Weigh in the same way each time, and take the waist at the navel. Photos on the same day make the tape easier to trust.</p>
      </header>
      <div className="progress-layout">
        <MeasureForm />
        <div className="stack">
          <ChartCard
            title="Weight"
            label="Body weight"
            unit={weightUnit}
            color="#d4532b"
            points={measurements.filter((item) => item.weightKg != null).map((item) => ({ date: item.date, value: weightToDisplay(item.weightKg as number, weightUnit) }))}
            delta={latestDelta(state.measurements, 'weightKg')}
            deltaUnit={weightUnit}
            convert={(value) => weightToDisplay(value, weightUnit)}
          />
          <ChartCard
            title="Waist"
            label="Waist"
            unit={lengthUnit}
            color="#1d6b45"
            points={measurements.filter((item) => item.waistCm != null).map((item) => ({ date: item.date, value: lengthToDisplay(item.waistCm as number, lengthUnit) }))}
            delta={latestDelta(state.measurements, 'waistCm')}
            deltaUnit={lengthUnit}
            convert={(value) => lengthToDisplay(value, lengthUnit)}
          />
          {measurements.some((item) => item.hipsCm != null) && (
            <ChartCard
              title="Hips"
              label="Hips"
              unit={lengthUnit}
              color="#8a5a12"
              points={measurements.filter((item) => item.hipsCm != null).map((item) => ({ date: item.date, value: lengthToDisplay(item.hipsCm as number, lengthUnit) }))}
              delta={latestDelta(state.measurements, 'hipsCm')}
              deltaUnit={lengthUnit}
              convert={(value) => lengthToDisplay(value, lengthUnit)}
            />
          )}
          {measurements.some((item) => item.thighCm != null) && (
            <ChartCard
              title="Thigh"
              label="Thigh"
              unit={lengthUnit}
              color="#8d2e14"
              points={measurements.filter((item) => item.thighCm != null).map((item) => ({ date: item.date, value: lengthToDisplay(item.thighCm as number, lengthUnit) }))}
              delta={latestDelta(state.measurements, 'thighCm')}
              deltaUnit={lengthUnit}
              convert={(value) => lengthToDisplay(value, lengthUnit)}
            />
          )}
        </div>
      </div>
      <section className="card stack">
        <h2>Plate, last 28 days</h2>
        <div className="cal">
          {days.map((iso) => {
            const status = dayStatus(state, iso)
            const shown = status === 'empty' && weekdayIndex(iso) === state.settings.offDay ? 'off' : status
            return (
              <Link key={iso} to={`/eat?date=${iso}`} className={`cal-cell ${shown}${iso === today ? ' today' : ''}`} title={`${formatDay(iso)} · ${shown}`}>
                {formatDay(iso, { day: 'numeric' })}
              </Link>
            )
          })}
        </div>
        <p className="footnote legend">
          <span className="swatch on" /> On the plate
          <span className="swatch slip" /> Slip
          <span className="swatch off" /> Off day
        </p>
      </section>
      <section className="card">
        <h2>Entries</h2>
        {measurements.length === 0 ? (
          <p>No measurements yet.</p>
        ) : (
          <ul className="history">
            {[...measurements].reverse().map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{formatDay(item.date, { day: 'numeric', month: 'short' })}</strong>
                  <span>
                    {[
                      item.weightKg != null ? formatWeight(item.weightKg, weightUnit) : null,
                      item.waistCm != null ? `waist ${formatLength(item.waistCm, lengthUnit)}` : null,
                      item.hipsCm != null ? `hips ${formatLength(item.hipsCm, lengthUnit)}` : null,
                      item.thighCm != null ? `thigh ${formatLength(item.thighCm, lengthUnit)}` : null,
                      item.photosTaken ? 'photos' : null,
                    ]
                      .filter(Boolean)
                      .join(' · ') || item.note}
                  </span>
                </div>
                <button className="btn-text danger" type="button" onClick={() => actions.removeMeasurement(item.id)}>
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

function ChartCard({
  title,
  label,
  unit,
  color,
  points,
  delta,
  deltaUnit,
  convert,
}: {
  title: string
  label: string
  unit: string
  color: string
  points: { date: string; value: number }[]
  delta: { delta: number; prev: { date: string } } | null
  deltaUnit: string
  convert: (value: number) => number
}) {
  return (
    <section className="card stack">
      <div className="row-between">
        <h2>{title}</h2>
        {delta && (
          <span className="footnote">
            {formatSigned(convert(delta.delta))} {deltaUnit} from {formatDay(delta.prev.date, { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>
      <Chart points={points} unit={unit} color={color} label={label} />
    </section>
  )
}

function MeasureForm() {
  const { state, actions } = useStore()
  const [date, setDate] = useState(localISO())
  const [message, setMessage] = useState('')
  const existing = state.measurements.find((item) => item.date === date)
  const { weightUnit, lengthUnit } = state.settings

  function read(value: FormDataEntryValue | null) {
    const text = String(value ?? '').trim()
    if (!text) return null
    const number = Number(text)
    return Number.isFinite(number) ? number : Number.NaN
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const weight = read(data.get('weight'))
    const waist = read(data.get('waist'))
    const hips = read(data.get('hips'))
    const thigh = read(data.get('thigh'))
    if ([weight, waist, hips, thigh].some((value) => Number.isNaN(value))) {
      setMessage('Use numbers only.')
      return
    }
    const note = String(data.get('note') ?? '').trim()
    const photosTaken = data.get('photos') === 'on'
    if (weight == null && waist == null && hips == null && thigh == null && !note && !photosTaken) {
      setMessage('Add a measurement, a note, or mark that photos were taken.')
      return
    }
    actions.saveMeasurement({
      date,
      weightKg: weight == null ? undefined : weightToKg(weight, weightUnit),
      waistCm: waist == null ? undefined : lengthToCm(waist, lengthUnit),
      hipsCm: hips == null ? undefined : lengthToCm(hips, lengthUnit),
      thighCm: thigh == null ? undefined : lengthToCm(thigh, lengthUnit),
      note,
      photosTaken,
    })
    setMessage(`Saved ${formatDay(date, { day: 'numeric', month: 'short' })}.`)
  }

  return (
    <form key={`${date}-${existing?.id ?? 'new'}`} className="card stack progress-form" onSubmit={onSubmit}>
      <h2>{existing ? 'Update this day' : 'New entry'}</h2>
      <label className="field">
        <span>Date</span>
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>
      <div className="form-grid">
        <label className="field">
          <span>Weight ({weightUnit})</span>
          <input name="weight" inputMode="decimal" defaultValue={existing?.weightKg != null ? trimNumber(weightToDisplay(existing.weightKg, weightUnit)) : ''} />
        </label>
        <label className="field">
          <span>Waist ({lengthUnit})</span>
          <input name="waist" inputMode="decimal" defaultValue={existing?.waistCm != null ? trimNumber(lengthToDisplay(existing.waistCm, lengthUnit)) : ''} />
        </label>
        <label className="field">
          <span>Hips ({lengthUnit})</span>
          <input name="hips" inputMode="decimal" defaultValue={existing?.hipsCm != null ? trimNumber(lengthToDisplay(existing.hipsCm, lengthUnit)) : ''} />
        </label>
        <label className="field">
          <span>Thigh ({lengthUnit})</span>
          <input name="thigh" inputMode="decimal" defaultValue={existing?.thighCm != null ? trimNumber(lengthToDisplay(existing.thighCm, lengthUnit)) : ''} />
        </label>
      </div>
      <label className="field">
        <span>Note</span>
        <textarea name="note" defaultValue={existing?.note ?? ''} placeholder="Same scale, morning, after the bathroom." />
      </label>
      <label className="check">
        <input type="checkbox" name="photos" defaultChecked={existing?.photosTaken ?? false} />
        <span>Progress photos taken</span>
      </label>
      {message && <p className="footnote">{message}</p>}
      <button className="btn btn-primary" type="submit">
        Save entry
      </button>
    </form>
  )
}
