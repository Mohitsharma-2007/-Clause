import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { KnowledgeVault } from './pages/KnowledgeVault'
import { Violations } from './pages/Violations'
import { Reports } from './pages/Reports'
import { Assistant } from './pages/Assistant'
import { Onboarding } from './pages/Onboarding'
import { LandingPage } from './pages/LandingPage'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Contact } from './pages/Contact'

function AppContent() {
  const location = useLocation()
  const onboardingComplete = localStorage.getItem('clause_onboarding')

  // Public routes
  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/contact') {
    return (
      <Layout>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    )
  }

  // Onboarding (No Layout)
  if (location.pathname === '/onboarding') {
    return (
      <Routes location={location} key={location.pathname}>
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    )
  }

  // Protected App Routes
  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vault" element={<KnowledgeVault />} />
          <Route path="/knowledge" element={<KnowledgeVault />} /> {/* Alias */}
          <Route path="/violations" element={<Violations />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/assistant" element={<Assistant />} />
          {/* Fallback for authenticated users going to root if not handled above, but root is LandingPage now. 
               Maybe redirect / to /dashboard if logged in? For now leave as LandingPage.
           */}
        </Routes>
      </AnimatePresence>
    </Layout>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
