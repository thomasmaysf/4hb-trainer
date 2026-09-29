import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { localISO, WEEKDAYS } from '../lib/dates'
import { defaultState, isAppState, normalizeSettings } from '../lib/repository'
import { trimNumber, weightToDisplay, weightToKg } from '../lib/units'
import { useStore } from '../store'
import type { LengthUnit, WeightUnit } from '../types'

export function Settings() {
  const { state, actions } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [clearArmed, setClearArmed] = useState(false)
  const { settings } = state

  useEffect(() => {
    document.title = 'Settings · 4HB Trainer'
  }, [])

  function exportBackup() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `4hb-trainer-${localISO()}.json`
    link.click()
    URL.revokeObjectURL(url)
    setMessage('Backup downloaded. It contains your logs and nothing else.')
  }

  function importBackup(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(String(reader.result))
        if (!isAppState(parsed)) {
          setMessage('That file is not a 4HB Trainer backup.')
          return
        }
        actions.replaceAll({ ...parsed, settings: normalizeSettings(parsed.settings), draft: parsed.draft ?? null })
        setMessage('Backup loaded in this browser.')
      } catch {
        setMessage('Could not read that file.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="stack-lg settings-page">
      <header className="page-head">
        <p className="kicker">This browser</p>
        <h1>Settings</h1>
        <p className="lede">Logs stay on this device until you export them. A hosted account can use the same backup later.</p>
      </header>
      <section className="card stack">
        <h2>Units</h2>
        <div className="row-gap">
          <Toggle<WeightUnit> value={settings.weightUnit} options={['kg', 'lb']} onChange={(weightUnit) => actions.updateSettings({ weightUnit })} />
          <Toggle<LengthUnit> value={settings.lengthUnit} options={['cm', 'in']} onChange={(lengthUnit) => actions.updateSettings({ lengthUnit })} />
        </div>
      </section>
      <section className="card stack">
        <h2>Week</h2>
        <label className="field">
          <span>Off day</span>
          <select value={settings.offDay} onChange={(event) => actions.updateSettings({ offDay: Number(event.target.value) })}>
            {WEEKDAYS.map((name, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <p className="footnote">
          The training plan is chosen on the <Link to="/programs">Programs</Link> page. The off day only applies while the slow-carb plate is part of that plan.
        </p>
      </section>
      <section className="card stack">
        <h2>Swing dose</h2>
        <div className="form-grid">
          <label className="field">
            <span>Rep target</span>
            <input
              type="number"
              min={10}
              max={300}
              value={settings.swingTarget}
              onChange={(event) => {
                const value = event.target.valueAsNumber
                if (!Number.isFinite(value)) return
                actions.updateSettings({ swingTarget: Math.min(300, Math.max(10, Math.round(value))) })
              }}
            />
          </label>
          <label className="field">
            <span>Default bell ({settings.weightUnit})</span>
            <input
              type="number"
              min={4}
              step="0.5"
              value={trimNumber(weightToDisplay(settings.bellKg, settings.weightUnit))}
              onChange={(event) => {
                const value = event.target.valueAsNumber
                if (!Number.isFinite(value)) return
                const kg = weightToKg(value, settings.weightUnit)
                actions.updateSettings({ bellKg: Math.min(80, Math.max(4, kg)) })
              }}
            />
          </label>
        </div>
        <p className="footnote">The bell you can swing cleanly for about 20 reps is the right starting weight. 16 kg is the default here.</p>
      </section>
      <section className="card stack">
        <h2>Backup</h2>
        <p>Export before you switch browsers or phones. Import replaces the log in this browser.</p>
        <div className="row-gap">
          <button className="btn btn-primary" type="button" onClick={exportBackup}>
            Download backup
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => fileRef.current?.click()}>
            Import backup
          </button>
          <input
            ref={fileRef}
            className="sr"
            type="file"
            accept="application/json"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) importBackup(file)
              event.target.value = ''
            }}
          />
        </div>
        {clearArmed ? (
          <button
            className="btn-text danger"
            type="button"
            onClick={() => {
              actions.replaceAll(defaultState())
              setClearArmed(false)
              setMessage('Log cleared on this browser.')
            }}
          >
            Clear the log now
          </button>
        ) : (
          <button className="btn-text danger" type="button" onClick={() => setClearArmed(true)}>
            Clear this browser’s log
          </button>
        )}
        {message && <p className="footnote">{message}</p>}
      </section>
      <section className="card stack">
        <h2>Hosting later</h2>
        <p>
          This version is a static app. <code>npm run build</code> writes a <code>dist</code> folder you can put on Cloudflare Pages, Netlify, or any static host. The <code>public/_redirects</code> file sends unknown paths back to the app.
        </p>
        <p>Progress is stored under the key <code>4hb-trainer-v1</code> in this browser. When you add an account, replace the save and load functions in <code>src/lib/repository.ts</code>. The screens already talk to that one place.</p>
      </section>
    </div>
  )
}

function Toggle<T extends string>({ value, options, onChange }: { value: T; options: T[]; onChange: (value: T) => void }) {
  return (
    <div className="toggle" role="group">
      {options.map((option) => (
        <button key={option} type="button" className={option === value ? 'active' : ''} onClick={() => onChange(option)} aria-pressed={option === value}>
          {option}
        </button>
      ))}
    </div>
  )
}
