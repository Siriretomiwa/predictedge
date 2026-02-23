import { NavProvider, useNav } from './context/NavContext.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import AuthModal from './components/AuthModal.jsx'
import HomePage from './pages/HomePage.jsx'
import TipsPage from './pages/TipsPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import LeaderboardPage from './pages/LeaderboardPage.jsx'
import ChallengePage from './pages/ChallengePage.jsx'
import SavedPage from './pages/SavedPage.jsx'
import PricingPage from './pages/PricingPage.jsx'

function Pages() {
  const { page } = useNav()

  const PAGES = {
    home:        <HomePage />,
    tips:        <TipsPage />,
    results:     <ResultsPage />,
    leaderboard: <LeaderboardPage />,
    challenge:   <ChallengePage />,
    saved:       <SavedPage />,
    pricing:     <PricingPage />,
  }

  return (
    <div key={page} style={{ animation: 'fadeIn .2s ease' }}>
      {PAGES[page] || PAGES.home}
    </div>
  )
}

function AppInner() {
  const { authModal } = useAuth()
  return (
    <>
      <Layout>
        <Pages />
      </Layout>
      {authModal && <AuthModal />}
    </>
  )
}

export default function App() {
  return (
    <NavProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </NavProvider>
  )
}
