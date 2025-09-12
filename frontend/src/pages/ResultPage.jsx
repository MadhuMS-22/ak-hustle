import classNames from 'classnames/bind'
import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CodeVerification from '../components/CodeVerification'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const TeamPage = () => {
  const navigate = useNavigate()
  const [teamName, setTeamName] = useState('')
  const [teamData, setTeamData] = useState(null)
  const [rounds, setRounds] = useState({
    round1: { status: 'pending', result: null }, // pending, completed, passed, failed
    round2: { status: 'pending', result: null },
    round3: { status: 'pending', result: null }
  })
  const [showCodeVerification, setShowCodeVerification] = useState(false)

  useEffect(() => {
    // Get team data from localStorage (set during login)
    const storedTeam = localStorage.getItem('hustle_team')
    if (storedTeam) {
      const parsedTeamData = JSON.parse(storedTeam)
      setTeamData(parsedTeamData)
      setTeamName(parsedTeamData.teamName || 'Unknown Team')
    } else {
      // If no team data, redirect to login
      navigate('/login')
    }
  }, [navigate])

  const handleLogout = () => {
    // Clear team data from localStorage
    localStorage.removeItem('hustle_team')
    // Redirect to home page
    navigate('/')
  }

  const handleStartRound = (roundNumber) => {
    console.log(`Starting Round ${roundNumber}`)
    if (roundNumber === 2) {
      navigate('/round-2')
    } else if (roundNumber === 3) {
      setShowCodeVerification(true)
    } else {
      // For other rounds, show placeholder
      alert(`Starting Round ${roundNumber} for ${teamName}`)
    }
  }

  const handleCodeVerified = () => {
    setShowCodeVerification(false)
    navigate('/round-3')
  }

  const handleCodeVerificationCancel = () => {
    setShowCodeVerification(false)
  }

  const getRoundStatus = (round) => {
    switch (round.status) {
      case 'completed':
        return round.result ? 'passed' : 'failed'
      case 'pending':
        return 'pending'
      default:
        return 'pending'
    }
  }

  const getRoundMessage = (round, roundNumber) => {
    const status = getRoundStatus(round)
    switch (status) {
      case 'passed':
        return `Passed! You're qualified for Round ${roundNumber + 1}`
      case 'failed':
        return "You're not qualified for next round"
      case 'pending':
        return "Result not available"
      default:
        return "Result not available"
    }
  }

  return (
    <div className='bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 font-sans antialiased min-h-screen'>
      <Navbar />

      <main className="pt-20 min-h-screen">
        {/* Team Header Section */}
        <div className='text-center py-12 px-4'>
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-white bg-opacity-10 text-purple-300 shadow-xl backdrop-blur-md border border-white border-opacity-20">
                <img src="https://placehold.co/64x64/E9D5FF/6D28D9?text=Team" alt="Team Icon" className="h-16 w-16" />
              </div>
            </div>
            <h1 className='text-4xl sm:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent'>
              Welcome, {teamName}!
            </h1>
            <p className='text-lg text-gray-300 mb-8'>Your team dashboard - check results and start new rounds</p>

            {/* Team Info Card */}
            {teamData && (
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white border-opacity-20 max-w-2xl mx-auto mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Team Information</h3>
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-gray-300 text-sm">Team Name</p>
                    <p className="text-white font-medium">{teamData.teamName}</p>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Leader</p>
                    <p className="text-white font-medium">{teamData.leader === 'member1' ? teamData.member1Name : teamData.member2Name}</p>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Member 1</p>
                    <p className="text-white font-medium">{teamData.member1Name}</p>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Member 2</p>
                    <p className="text-white font-medium">{teamData.member2Name}</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleLogout}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 transform shadow-lg flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4 4m0 0l-4 4m4-4H7m13 0v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Competition Rounds Section */}
        <div className='py-16 px-4'>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Competition Rounds
              </h2>
              <p className="text-lg text-gray-300">Complete each round to unlock the next one. Good luck!</p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              {/* Round 1 */}
              <div className={classNames('p-6 rounded-2xl text-center bg-white/10 backdrop-blur-md border border-white/20 shadow-xl w-full flex flex-col justify-center items-center gap-6 transition-all duration-300 hover:scale-105', {
                "bg-green-600/20 border-green-400/30": getRoundStatus(rounds.round1) === 'passed',
                "bg-red-600/20 border-red-400/30": getRoundStatus(rounds.round1) === 'failed',
                "bg-blue-600/20 border-blue-400/30": getRoundStatus(rounds.round1) === 'pending'
              })}>
                <div className='flex flex-col items-center gap-4'>
                  <div className="p-4 rounded-full bg-white/10 backdrop-blur-md">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h3 className='text-2xl font-bold text-white'>Round 1: Aptitude</h3>
                  <p className='text-sm font-medium text-gray-300 text-center leading-relaxed'>
                    {getRoundMessage(rounds.round1, 1)}
                  </p>
                </div>
                <button
                  onClick={() => handleStartRound(1)}
                  className='bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/30'
                >
                  Start Round 1
                </button>
              </div>

              {/* Round 2 */}
              <div className={classNames('p-6 rounded-2xl text-center bg-white/10 backdrop-blur-md border border-white/20 shadow-xl w-full flex flex-col justify-center items-center gap-6 transition-all duration-300 hover:scale-105', {
                "bg-green-600/20 border-green-400/30": getRoundStatus(rounds.round2) === 'passed',
                "bg-red-600/20 border-red-400/30": getRoundStatus(rounds.round2) === 'failed',
                "bg-blue-600/20 border-blue-400/30": getRoundStatus(rounds.round2) === 'pending'
              })}>
                <div className='flex flex-col items-center gap-4'>
                  <div className="p-4 rounded-full bg-white/10 backdrop-blur-md">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h3 className='text-2xl font-bold text-white'>Round 2: Coding</h3>
                  <p className='text-sm font-medium text-gray-300 text-center leading-relaxed'>
                    {getRoundMessage(rounds.round2, 2)}
                  </p>
                </div>
                <button
                  onClick={() => handleStartRound(2)}
                  className='bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/30'
                >
                  Start Round 2
                </button>
              </div>

              {/* Round 3 */}
              <div className={classNames('p-6 rounded-2xl text-center bg-white/10 backdrop-blur-md border border-white/20 shadow-xl w-full flex flex-col justify-center items-center gap-6 transition-all duration-300 hover:scale-105', {
                "bg-green-600/20 border-green-400/30": getRoundStatus(rounds.round3) === 'passed',
                "bg-red-600/20 border-red-400/30": getRoundStatus(rounds.round3) === 'failed',
                "bg-blue-600/20 border-blue-400/30": getRoundStatus(rounds.round3) === 'pending'
              })}>
                <div className='flex flex-col items-center gap-4'>
                  <div className="p-4 rounded-full bg-white/10 backdrop-blur-md">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h3 className='text-2xl font-bold text-white'>Round 3: Final</h3>
                  <p className='text-sm font-medium text-gray-300 text-center leading-relaxed'>
                    {getRoundMessage(rounds.round3, 3)}
                  </p>
                </div>
                <button
                  onClick={() => handleStartRound(3)}
                  className='bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/30'
                >
                  Start Round 3
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Code Verification Modal */}
      {showCodeVerification && (
        <CodeVerification
          onCodeVerified={handleCodeVerified}
          onCancel={handleCodeVerificationCancel}
        />
      )}

      <Footer />
    </div>
  )
}

export default TeamPage
