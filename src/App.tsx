import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Explore from './pages/Explore'
import PointDetail from './pages/PointDetail'
import Favorites from './pages/Favorites'
import Rubric from './pages/Rubric'
import PrincipleDetail from './pages/PrincipleDetail'
import OrganFinder from './pages/OrganFinder'
import MirrorMap from './pages/MirrorMap'
import DiagnosisWizard from './pages/DiagnosisWizard'
import DaoMa from './pages/DaoMa'
import SmartDiagnosis from './pages/SmartDiagnosis'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/point/:id" element={<PointDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/rubric" element={<Rubric />} />
          <Route path="/organs" element={<OrganFinder />} />
          <Route path="/mirror" element={<MirrorMap />} />
          <Route path="/diagnosis" element={<DiagnosisWizard />} />
          <Route path="/dao-ma" element={<DaoMa />} />
          <Route path="/smart-diagnosis" element={<SmartDiagnosis />} />
          <Route path="/principle/:id" element={<PrincipleDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
