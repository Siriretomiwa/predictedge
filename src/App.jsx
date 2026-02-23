import { useState } from 'react'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import TipsPage from './pages/TipsPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import LeaderboardPage from './pages/LeaderboardPage.jsx'
import ChallengePage from './pages/ChallengePage.jsx'
import PricingPage from './pages/PricingPage.jsx'

export default function App() {
  const [page, setPage] = useState('home')

  const PAGES = {
    home:        <HomePage setPage={setPage} />,
    tips:        <TipsPage />,
    results:     <ResultsPage />,
    leaderboard: <LeaderboardPage />,
    challenge:   <ChallengePage />,
    pricing:     <PricingPage />,
  }

  return (
    <Layout page={page} setPage={setPage}>
      <div key={page} style={{ animation: 'fade-in 0.25s ease' }}>
        {PAGES[page] || PAGES.home}
      </div>
    </Layout>
  )
}
