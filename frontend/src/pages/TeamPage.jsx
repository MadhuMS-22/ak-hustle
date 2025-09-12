import classNames from 'classnames/bind'
import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CodeVerification from '../components/CodeVerification'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import apiService from '../services/api'

const TeamPage = () => {
  const navigate = useNavigate()
  const [teamName, setTeamName] = useState('')
  const [teamData, setTeamData] = useState(null)
  const [rounds, setRounds] = useState({
    round1: { status: 'pending', result: null, score: null },
    round2: { status: 'pending', result: null, score: null },
    round3: { status: 'pending', result: null, score: null }
  })
  const [showCodeVerification, setShowCodeVerification] = useState(false)
  const [verificationRound, setVerificationRound] = useState(null)
  const [showResults, setShowResults] = useState({ round1: false, round2: false })
  const [loading, setLoading] = useState(true)
  const [roundCodes, setRoundCodes] = useState({ round2: '', round3: '' })

  useEffect(() => {
    // Get team data from localStorage (set during login)
    const storedTeam = localStorage.getItem('hustle_team')
    if (storedTeam) {
      const parsedTeamData = JSON.parse(storedTeam)
      setTeamData(parsedTeamData)
      setTeamName(parsedTeamData.teamName || 'Unknown Team')
      // Fetch real-time team data from backend
      fetchTeamData(parsedTeamData._id)
    } else {
      // If no team data, redirect to login
      navigate('/login')
    }
  }, [navigate])

  // Fetch team data from backend
  const fetchTeamData = async (teamId) => {
    try {
      setLoading(true)

      // Fetch team details with current status
      const teamResponse = await apiService.get(`/competition/team/${teamId}`)
      if (teamResponse.success) {
        const team = teamResponse.data.team
        setTeamData(team)

        // Update rounds based on team's competition status
        console.log('Team competition status:', team.competitionStatus)
        console.log('Team scores:', team.scores)

        // FOR TESTING: Unlock all rounds regardless of dependencies
        const updatedRounds = {
          round1: {
            status: team.competitionStatus === 'registered' ? 'completed' : 'available',
            result: team.competitionStatus === 'registered' ? true : null,
            score: team.scores?.round1 || null
          },
          round2: {
            status: 'available', // Always available for testing
            result: null,
            score: team.scores?.round2 || null
          },
          round3: {
            status: 'available', // Always available for testing
            result: null,
            score: team.scores?.round3 || null
          }
        }

        console.log('Updated rounds:', updatedRounds)
        console.log('Round 1 status:', updatedRounds.round1.status, 'result:', updatedRounds.round1.result)
        console.log('Round 2 status:', updatedRounds.round2.status, 'result:', updatedRounds.round2.result)
        console.log('Round 3 status:', updatedRounds.round3.status, 'result:', updatedRounds.round3.result)
        setRounds(updatedRounds)
      }

      // Fetch round codes for verification
      const codesResponse = await apiService.get('/competition/round-codes')
      if (codesResponse.success) {
        console.log('Round codes fetched:', codesResponse.data.roundCodes)
        setRoundCodes(codesResponse.data.roundCodes)
      } else {
        console.log('Failed to fetch round codes:', codesResponse)
      }

    } catch (error) {
      console.error('Error fetching team data:', error)
      // Fallback to localStorage data if API fails
    } finally {
      setLoading(false)
    }
  }

  // Set up real-time updates
  useEffect(() => {
    if (teamData?._id) {
      // Poll for updates every 30 seconds
      const interval = setInterval(() => {
        fetchTeamData(teamData._id)
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [teamData?._id])

  const handleLogout = () => {
    // Clear team data from localStorage
    localStorage.removeItem('hustle_team')
    // Redirect to home page
    navigate('/')
  }

  const handleStartRound = (roundNumber) => {
    console.log(`Starting Round ${roundNumber}`)
    if (roundNumber === 1) {
      // Round 1 is offline - show result
      setShowResults(prev => ({ ...prev, round1: true }))
    } else if (roundNumber === 2) {
      // Round 2 requires authentication code
      setVerificationRound(2)
      setShowCodeVerification(true)
    } else if (roundNumber === 3) {
      // Round 3 requires authentication code
      setVerificationRound(3)
      setShowCodeVerification(true)
    }
  }

  const handleViewResults = (roundNumber) => {
    setShowResults(prev => ({ ...prev, [`round${roundNumber}`]: true }))
  }

  const handleCodeVerified = (enteredCode) => {
    // Verify the entered code against the current round code
    const correctCode = verificationRound === 2 ? roundCodes.round2 : roundCodes.round3

    if (enteredCode === correctCode) {
      setShowCodeVerification(false)
      if (verificationRound === 2) {
        navigate('/round-2')
      } else if (verificationRound === 3) {
        navigate('/round-3')
      }
      setVerificationRound(null)
    } else {
      alert('Invalid access code. Please check with the admin.')
    }
  }

  const handleCodeVerificationCancel = () => {
    setShowCodeVerification(false)
  }

  const getRoundStatus = (round, roundNumber) => {
    console.log(`Getting status for Round ${roundNumber}:`, {
      round,
      round1Status: rounds.round1?.status,
      round2Status: rounds.round2?.status,
      round3Status: rounds.round3?.status
    })

    // FOR TESTING: Remove dependencies - all rounds are available
    if (roundNumber === 1) {
      const status = round.status === 'completed' ? (round.result ? 'passed' : 'failed') : 'available'
      console.log(`Round 1 status: ${status}`)
      return status
    } else if (roundNumber === 2) {
      // Round 2 is always available for testing
      const status = round.status === 'completed' ? (round.result ? 'passed' : 'failed') : 'available'
      console.log(`Round 2 status: ${status}`)
      return status
    } else if (roundNumber === 3) {
      // Round 3 is always available for testing
      const status = round.status === 'completed' ? (round.result ? 'passed' : 'failed') : 'available'
      console.log(`Round 3 status: ${status}`)
      return status
    }
    return 'available'
  }

  const getRoundMessage = (round, roundNumber) => {
    const status = getRoundStatus(round, roundNumber)
    switch (status) {
      case 'passed':
        return `Congratulations! You qualified for Round ${roundNumber}!`
      case 'failed':
        return `Round ${roundNumber} completed. Better luck next time!`
      case 'available':
        return `Round ${roundNumber} is available for testing. Click to start!`
      case 'locked':
        return `Complete previous round to unlock Round ${roundNumber}`
      case 'pending':
        return `Round ${roundNumber} - Registration completed successfully!`
      default:
        return "Round information not available"
    }
  }

  if (loading) {
    return (
      <div className='bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 font-sans antialiased min-h-screen flex items-center justify-center'>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading team data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 font-sans antialiased min-h-screen'>
      <Navbar />

      <main className="pt-20 min-h-screen">
        {/* Team Header Section */}
        <div className='text-center py-12 px-4'>
          <div className="max-w-4xl mx-auto">
            <h1 className='text-4xl sm:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent'>
              Welcome, {teamName}!
            </h1>
            <p className='text-lg text-gray-300 mb-4'>Your team dashboard - check results and start new rounds</p>

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
                "bg-green-600/20 border-green-400/30": getRoundStatus(rounds.round1, 1) === 'passed',
                "bg-red-600/20 border-red-400/30": getRoundStatus(rounds.round1, 1) === 'failed',
                "bg-orange-600/20 border-orange-400/30": getRoundStatus(rounds.round1, 1) === 'pending'
              })}>
                <div className='flex flex-col items-center gap-4'>
                  <div className="p-4 rounded-full bg-white/10 backdrop-blur-md">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h3 className='text-2xl font-bold text-white'>Round 1: Aptitude</h3>
                  <p className='text-sm font-medium text-gray-300 text-center leading-relaxed'>
                    {getRoundMessage(rounds.round1, 1)}
                  </p>
                  <div className="text-xs text-gray-400">
                    Offline Round - Registration Successful!
                  </div>
                </div>
                <button
                  onClick={() => handleViewResults(1)}
                  className='bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/30'
                >
                  View Result
                </button>
              </div>

              {/* Round 2 */}
              <div className={classNames('p-6 rounded-2xl text-center bg-white/10 backdrop-blur-md border border-white/20 shadow-xl w-full flex flex-col justify-center items-center gap-6 transition-all duration-300 hover:scale-105', {
                "bg-green-600/20 border-green-400/30": getRoundStatus(rounds.round2, 2) === 'passed',
                "bg-red-600/20 border-red-400/30": getRoundStatus(rounds.round2, 2) === 'failed',
                "bg-blue-600/20 border-blue-400/30": getRoundStatus(rounds.round2, 2) === 'available',
                "bg-gray-600/20 border-gray-400/30": getRoundStatus(rounds.round2, 2) === 'locked'
              })}>
                <div className='flex flex-col items-center gap-4'>
                  <div className="p-4 rounded-full bg-white/10 backdrop-blur-md">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h3 className='text-2xl font-bold text-white'>Round 2: Coding</h3>
                  <p className='text-sm font-medium text-gray-300 text-center leading-relaxed'>
                    {getRoundMessage(rounds.round2, 2)}
                  </p>
                  <div className="text-xs text-gray-400">
                    {getRoundStatus(rounds.round2, 2) === 'locked' ? 'Locked - Complete Round 1' : 'Online Round - Requires Access Code'}
                  </div>
                </div>
                {getRoundStatus(rounds.round2, 2) === 'locked' ? (
                  <button
                    disabled
                    className='bg-gray-500/30 text-gray-400 font-semibold py-3 px-6 rounded-xl cursor-not-allowed backdrop-blur-sm border border-gray-500/30'
                  >
                    Locked
                  </button>
                ) : getRoundStatus(rounds.round2, 2) === 'passed' || getRoundStatus(rounds.round2, 2) === 'failed' ? (
                  <button
                    onClick={() => handleViewResults(2)}
                    className='bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/30'
                  >
                    View Result
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartRound(2)}
                    className='bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/30'
                  >
                    Start Round 2
                  </button>
                )}
              </div>

              {/* Round 3 */}
              <div className={classNames('p-6 rounded-2xl text-center bg-white/10 backdrop-blur-md border border-white/20 shadow-xl w-full flex flex-col justify-center items-center gap-6 transition-all duration-300 hover:scale-105', {
                "bg-green-600/20 border-green-400/30": getRoundStatus(rounds.round3, 3) === 'passed',
                "bg-red-600/20 border-red-400/30": getRoundStatus(rounds.round3, 3) === 'failed',
                "bg-blue-600/20 border-blue-400/30": getRoundStatus(rounds.round3, 3) === 'available',
                "bg-gray-600/20 border-gray-400/30": getRoundStatus(rounds.round3, 3) === 'locked'
              })}>
                <div className='flex flex-col items-center gap-4'>
                  <div className="p-4 rounded-full bg-white/10 backdrop-blur-md">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h3 className='text-2xl font-bold text-white'>Round 3: Final</h3>
                  <p className='text-sm font-medium text-gray-300 text-center leading-relaxed'>
                    {getRoundMessage(rounds.round3, 3)}
                  </p>
                  <div className="text-xs text-gray-400">
                    {getRoundStatus(rounds.round3, 3) === 'locked' ? 'Locked - Complete Round 2' : 'Final Round - Requires Access Code'}
                  </div>
                </div>
                {getRoundStatus(rounds.round3, 3) === 'locked' ? (
                  <button
                    disabled
                    className='bg-gray-500/30 text-gray-400 font-semibold py-3 px-6 rounded-xl cursor-not-allowed backdrop-blur-sm border border-gray-500/30'
                  >
                    Locked
                  </button>
                ) : getRoundStatus(rounds.round3, 3) === 'passed' || getRoundStatus(rounds.round3, 3) === 'failed' ? (
                  <button
                    onClick={() => handleViewResults(3)}
                    className='bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/30'
                  >
                    View Result
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartRound(3)}
                    className='bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/30'
                  >
                    Start Round 3
                  </button>
                )}
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
          roundNumber={verificationRound}
        />
      )}

      {/* Round 1 Result Modal */}
      {showResults.round1 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Round 1 Result</h3>
              <p className="text-green-300 text-lg mb-4">Congratulations! You Qualified!</p>
              <p className="text-gray-300 text-sm mb-6">
                You have successfully qualified for Round 2. The next round will be available soon!
              </p>
              <button
                onClick={() => setShowResults(prev => ({ ...prev, round1: false }))}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Round 2 Result Modal */}
      {showResults.round2 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Round 2 Result</h3>
              <p className="text-blue-300 text-lg mb-4">Round 2 Completed!</p>
              <div className="bg-white/10 rounded-lg p-4 mb-6">
                <p className="text-white text-sm mb-2">Status:</p>
                <p className="text-lg font-semibold text-blue-400">
                  {rounds.round2.result ? `Completed - ${rounds.round2.score || 'N/A'}%` : 'Pending Review'}
                </p>
              </div>
              <p className="text-gray-300 text-sm mb-6">
                {rounds.round2.result
                  ? `Round 2 completed successfully! Your score: ${rounds.round2.score || 'N/A'}%`
                  : 'Your Round 2 submission is being reviewed. Results will be announced soon!'
                }
              </p>
              <button
                onClick={() => setShowResults(prev => ({ ...prev, round2: false }))}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default TeamPage
