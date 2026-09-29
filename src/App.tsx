import { Navigate, Route, Routes } from 'react-router-dom'
import { Shell } from './components/Shell'
import { Eat } from './pages/Eat'
import { Library } from './pages/Library'
import { Links } from './pages/Links'
import { Programs } from './pages/Programs'
import { Progress } from './pages/Progress'
import { Session } from './pages/Session'
import { Settings } from './pages/Settings'
import { Today } from './pages/Today'
import { Train } from './pages/Train'

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Today />} />
        <Route path="train" element={<Train />} />
        <Route path="train/:templateId" element={<Session />} />
        <Route path="eat" element={<Eat />} />
        <Route path="progress" element={<Progress />} />
        <Route path="programs" element={<Programs />} />
        <Route path="links" element={<Links />} />
        <Route path="library" element={<Library />} />
        <Route path="library/:exerciseId" element={<Library />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
