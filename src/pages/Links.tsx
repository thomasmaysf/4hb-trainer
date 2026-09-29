import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { bookChapters } from '../bookLinks'
import { useStore } from '../store'
import type { ProgramId } from '../types'

const planChapters: Partial<Record<ProgramId, string[]>> = {
  'slow-carb': ['the-slow-carb-diet-i', 'the-slow-carb-diet-ii', 'damage-control', 'the-four-horsemen-of-fat-loss', 'the-slow-carb-diet-194-people'],
  swings: ['building-the-perfect-posterior'],
  occam: ['occam-s-protocol-i'],
  prehab: ['pre-hab'],
}

function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function Links() {
  const { state } = useStore()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const part = params.get('part') ?? 'all'
  const chapter = params.get('chapter')
  const planOnly = params.get('plan') === '1'

  useEffect(() => {
    document.title = 'Links · 4HB Trainer'
  }, [])

  const parts = useMemo(() => [...new Set(bookChapters.map((item) => item.part))], [])
  const planIds = useMemo(() => {
    const ids = new Set<string>()
    for (const program of state.settings.activePrograms) {
      for (const id of planChapters[program] ?? []) ids.add(id)
    }
    return ids
  }, [state.settings.activePrograms])

  const needle = query.trim().toLowerCase()
  const visible = bookChapters
    .filter((item) => (chapter ? item.id === chapter : true))
    .filter((item) => (part === 'all' ? true : item.part === part))
    .filter((item) => (planOnly ? planIds.has(item.id) : true))
    .map((item) => ({
      ...item,
      links: item.links.filter((link) => {
        if (!needle) return true
        return `${link.label} ${link.url} ${item.title} ${item.part}`.toLowerCase().includes(needle)
      }),
    }))
    .filter((item) => item.links.length > 0)

  const shown = visible.reduce((sum, item) => sum + item.links.length, 0)

  function setPart(next: string) {
    const following = new URLSearchParams(params)
    if (next === 'all') following.delete('part')
    else following.set('part', next)
    following.delete('chapter')
    setParams(following, { replace: true })
  }

  function setPlan(on: boolean) {
    const following = new URLSearchParams(params)
    if (on) following.set('plan', '1')
    else following.delete('plan')
    following.delete('chapter')
    setParams(following, { replace: true })
  }

  return (
    <div className="stack-lg">
      <header className="page-head">
        <p className="kicker">From the book</p>
        <h1>Links</h1>
        <p className="lede">
          Every web address printed in the book, grouped by the chapter it appears in. {shown} showing. These are the 2010 addresses, so some short links have moved.
        </p>
      </header>
      <label className="field">
        <span className="sr">Search links</span>
        <input value={query} placeholder="Search chapters or addresses" onChange={(event) => setQuery(event.target.value)} />
      </label>
      <div className="filter-row" role="group" aria-label="Chapter group">
        <button type="button" className={`chip${part === 'all' && !chapter ? ' active' : ''}`} onClick={() => setPart('all')}>
          All
        </button>
        <button type="button" className={`chip${planOnly ? ' active' : ''}`} aria-pressed={planOnly} onClick={() => setPlan(!planOnly)}>
          This plan
        </button>
        {parts.map((name) => (
          <button key={name} type="button" className={`chip${part === name && !chapter ? ' active' : ''}`} onClick={() => setPart(name)}>
            {name}
          </button>
        ))}
      </div>
      {visible.length === 0 && <p className="card">No addresses match that filter.</p>}
      {visible.map((item) => (
        <section key={item.id} className="card stack">
          <p className="kicker">{item.part}</p>
          <h2>{item.title}</h2>
          <div>
            {item.links.map((link) => (
              <a key={link.url} className="source-link" href={link.url} target="_blank" rel="noreferrer">
                <strong>{link.label}</strong>
                <span>{hostOf(link.url)}</span>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
