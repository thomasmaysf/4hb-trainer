import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Today', end: true },
  { to: '/train', label: 'Train' },
  { to: '/eat', label: 'Eat' },
  { to: '/progress', label: 'Progress' },
  { to: '/programs', label: 'Programs' },
  { to: '/library', label: 'Library' },
  { to: '/links', label: 'Links' },
]

export function Shell() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span>
            <strong>4HB Trainer</strong>
            <small>Minimum effective dose</small>
          </span>
        </div>
        <nav className="nav" aria-label="Primary">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/settings" className={({ isActive }) => `nav-link settings-link${isActive ? ' active' : ''}`}>
          Settings
        </NavLink>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span className="brand-inline">4HB</span>
          <nav aria-label="More">
            <NavLink to="/programs">Programs</NavLink>
            <NavLink to="/library">Library</NavLink>
            <NavLink to="/links">Links</NavLink>
            <NavLink to="/settings">Settings</NavLink>
          </nav>
        </header>
        <main className="page">
          <Outlet />
        </main>
      </div>
      <nav className="tabbar" aria-label="Primary">
        {links.slice(0, 4).map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
