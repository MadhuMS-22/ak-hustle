import classNames from 'classnames/bind'
import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CodeVerification from '../components/CodeVerification'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import apiService from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const TeamPage = () => {
  const navigate = useNavigate()
  const { logout, isAuthenticated, teamData: contextTeamData, loading: authLoading } = useAuth()
  const [teamName, setTeamName] = useState('')
  const [teamData, setTeamData] = useState(null)
  const [rounds, setRounds] = useState({
    round1: { status: 'pending', result: null, score: null },
    round2: { status: 'locked', result: null, score: null },
    round3: { status: 'locked', result: null, score: null }
  })
  const [showCodeVerification, setShowCodeVerification] = useState(false)
  const [verificationRound, setVerificationRound] = useState(null)
  const [loading, setLoading] = useState(true)
  const [roundCodes, setRoundCodes] = useState({ round2: '', round3: '' })

  useEffect(() => {
    // Wait for auth loading to complete
    if (authLoading) {
      return
    }

    // Check authentication status from context
    if (!isAuthenticated || !contextTeamData) {
      navigate('/login')
      return
    }

    // Use team data from context
    setTeamData(contextTeamData)
    setTeamName(contextTeamData.teamName || 'Unknown Team')
    // Fetch real-time team data from backend
    fetchTeamData(contextTeamData._id)
  }, [isAuthenticated, contextTeamData, navigate, authLoading])

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

        // Determine round statuses based on competition status and results announcement
        const updatedRounds = {
          round1: {
            status: team.competitionStatus === 'Registered' ? 'pending' :
              team.competitionStatus === 'Round1' ? 'available' :
                ['Round2', 'Round3', 'Selected'].includes(team.competitionStatus) ? 'completed' : 'locked',
            result: team.competitionStatus === 'Registered' ? null :
              team.competitionStatus === 'Round1' ? null :
                ['Round2', 'Round3', 'Selected'].includes(team.competitionStatus) ? true : null,
            score: team.scores?.round1 || null,
            announced: team.resultsAnnounced || false,
            qualified: team.competitionStatus === 'Round1' ? false :
              ['Round2', 'Round3', 'Selected'].includes(team.competitionStatus) ? true : null
          },
          round2: {
            status: team.competitionStatus === 'Round2' ? 'available' :
              ['Round3', 'Selected'].includes(team.competitionStatus) ? 'completed' : 'locked',
            result: ['Round3', 'Selected'].includes(team.competitionStatus) ? true : null,
            score: team.scores?.round2 || null,
            announced: team.resultsAnnounced || false,
            qualified: team.competitionStatus === 'Round2' ? false :
              ['Round3', 'Selected'].includes(team.competitionStatus) ? true : null
          },
          round3: {
            status: team.competitionStatus === 'Round3' ? 'available' :
              team.competitionStatus === 'Selected' ? 'completed' : 'locked',
            result: team.competitionStatus === 'Selected' ? true : null,
            score: team.scores?.round3 || null,
            announced: team.resultsAnnounced || false,
            qualified: team.competitionStatus === 'Round3' ? false :
              team.competitionStatus === 'Selected' ? true : null
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
    // Use the logout method from AuthContext
    logout()
    // Redirect to home page
    navigate('/')
  }

  const handleStartRound = (roundNumber) => {
    console.log(`Starting Round ${roundNumber}`)
    if (roundNumber === 1) {
      // Round 1 is offline - navigate to aptitude page
      navigate('/aptitude')
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

    if (roundNumber === 1) {
      if (round.status === 'completed') {
        return round.result ? 'passed' : 'failed'
      } else if (round.status === 'available') {
        return 'available'
      } else {
        return 'pending'
      }
    } else if (roundNumber === 2) {
      if (round.status === 'completed') {
        return round.result ? 'passed' : 'failed'
      } else if (round.status === 'available') {
        return 'available'
      } else {
        return 'locked'
      }
    } else if (roundNumber === 3) {
      if (round.status === 'completed') {
        return round.result ? 'passed' : 'failed'
      } else if (round.status === 'available') {
        return 'available'
      } else {
        return 'locked'
      }
    }
    return 'locked'
  }

  const getRoundMessage = (round, roundNumber) => {
    const status = getRoundStatus(round, roundNumber)
    const isAnnounced = round.announced
    const isQualified = round.qualified

    switch (status) {
      case 'passed':
        if (isAnnounced) {
          return `Congratulations! You qualified for Round ${roundNumber + 1}! Results have been announced.`
        } else {
          return `Round ${roundNumber} completed. Waiting for results to be announced.`
        }
      case 'failed':
        if (isAnnounced) {
          return `Round ${roundNumber} completed. Better luck next time! Results have been announced.`
        } else {
          return `Round ${roundNumber} completed. Waiting for results to be announced.`
        }
      case 'available':
        if (roundNumber === 1) {
          return `You are in Round 1. Please complete your task.`
        } else if (roundNumber === 2) {
          return `You are in Round 2. Please complete your task.`
        } else {
          return `You are in Round 3. Please complete your task.`
        }
      case 'locked':
        return `Locked. Complete previous round to unlock.`
      case 'pending':
        return `You are registered. Waiting for Round 1 to start.`
      default:
        return "Round information not available"
    }
  }

  // Special handling for Eliminated and Selected statuses
  if (teamData?.competitionStatus === 'Eliminated') {
    return (
      <div className='bg-gradient-to-br from-gray-900 via-red-900 to-indigo-900 font-sans antialiased min-h-screen flex items-center justify-center'>
        <div className="text-center max-w-2xl mx-auto p-8">
          <div className="text-8xl mb-6">😔</div>
          <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white via-red-300 to-red-400 bg-clip-text text-transparent">
            Thanks for Participating
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Unfortunately, you've been eliminated from the competition.
          </p>
          <div className="bg-red-600/20 border border-red-400/30 rounded-2xl p-8 shadow-2xl">
            <p className="text-red-300 text-lg mb-4">
              Thank you for your participation in the Hustel competition!
            </p>
            <p className="text-gray-300 text-sm">
              We appreciate your effort and hope you had a great experience.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-8 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-2xl transition-all duration-300 hover:scale-105"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  if (teamData?.competitionStatus === 'Selected') {
    return (
      <div className='bg-gradient-to-br from-purple-900 via-green-900 to-indigo-900 font-sans antialiased min-h-screen flex items-center justify-center'>
        <div className="text-center max-w-2xl mx-auto p-8">
          <div className="text-8xl mb-6">🎉</div>
          <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white via-green-300 to-green-400 bg-clip-text text-transparent">
            Congratulations!
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            You have been selected in the final round! 🎉
          </p>
          <div className="bg-green-600/20 border border-green-400/30 rounded-2xl p-8 shadow-2xl">
            <p className="text-green-300 text-lg mb-4">
              Outstanding performance! You've made it to the final selection.
            </p>
            <p className="text-gray-300 text-sm">
              Further details about the next steps will be communicated soon.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-8 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-2xl transition-all duration-300 hover:scale-105"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  if (authLoading || loading) {
    return (
      <div className='bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 font-sans antialiased min-h-screen flex items-center justify-center'>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {authLoading ? 'Checking authentication...' : 'Loading team data...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 font-sans antialiased min-h-screen relative overflow-hidden'>
      <Navbar />

      <main className="pt-20 min-h-screen">
        {/* Team Header Section */}
        <div className='text-center py-12 px-4'>
          <div className="max-w-4xl mx-auto">
            <h1 className='text-5xl sm:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white via-purple-300 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl'>
              Welcome, {teamName}!
            </h1>
            <p className='text-lg text-gray-300 mb-4'>Your team dashboard - check results and start new rounds</p>

          </div>
        </div>

        {/* Competition Rounds Section */}
        <div className='py-16 px-4'>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white via-purple-300 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl">
                Competition Rounds
              </h2>
              <p className="text-lg text-gray-300">Complete each round to unlock the next one. Good luck!</p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              {/* Round 1 */}
              <div className={classNames('p-8 rounded-3xl text-center glass-dark shadow-2xl w-full flex flex-col justify-center items-center gap-6 transition-all duration-500 hover:scale-105 hover:glow-purple', {
                "bg-green-600/40 border-green-400/50": getRoundStatus(rounds.round1, 1) === 'passed' && rounds.round1.announced,
                "bg-red-600/40 border-red-400/50": getRoundStatus(rounds.round1, 1) === 'failed' && rounds.round1.announced,
                "bg-orange-600/20 border-orange-400/30": getRoundStatus(rounds.round1, 1) === 'pending' || getRoundStatus(rounds.round1, 1) === 'available' || (getRoundStatus(rounds.round1, 1) === 'passed' && !rounds.round1.announced),
                "bg-gray-600/20 border-gray-400/30": getRoundStatus(rounds.round1, 1) === 'locked'
              })}>
                <div className='flex flex-col items-center gap-4'>
                  <div className="p-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white backdrop-blur-md glow-purple">
                    <span className="text-3xl font-bold text-white">1</span>
                  </div>
                  <h3 className='text-2xl font-bold text-white'>Round 1: Aptitude</h3>
                  <p className='text-sm font-medium text-gray-300 text-center leading-relaxed'>
                    {getRoundMessage(rounds.round1, 1)}
                  </p>
                </div>
                {getRoundStatus(rounds.round1, 1) === 'passed' || getRoundStatus(rounds.round1, 1) === 'failed' ? (
                  rounds.round1.announced ? (
                    <div className="text-center">
                      <div className="text-white text-lg font-bold mb-1">
                        {getRoundStatus(rounds.round1, 1) === 'passed' ? '✅ QUALIFIED!' : '❌ NOT QUALIFIED'}
                      </div>
                      <div className="text-gray-200 text-sm">
                        Results announced
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-orange-300 text-lg font-bold mb-1">
                        Round 1 Completed
                      </div>
                      <div className="text-gray-300 text-sm">
                        Waiting for results...
                      </div>
                    </div>
                  )
                ) : getRoundStatus(rounds.round1, 1) === 'available' ? (
                  <button
                    onClick={() => handleStartRound(1)}
                    className='bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-500 hover:scale-105 shadow-xl glow-purple'
                  >
                    Start Round 1
                  </button>
                ) : (
                  <button
                    disabled
                    className='bg-gray-500/30 text-gray-400 font-semibold py-3 px-6 rounded-xl cursor-not-allowed backdrop-blur-sm border border-gray-500/30'
                  >
                    {getRoundStatus(rounds.round1, 1) === 'pending' ? 'Waiting...' : 'Locked'}
                  </button>
                )}
              </div>

              {/* Round 2 */}
              <div className={classNames('p-8 rounded-3xl text-center glass-dark shadow-2xl w-full flex flex-col justify-center items-center gap-6 transition-all duration-500 hover:scale-105 hover:glow-blue', {
                "bg-green-600/40 border-green-400/50": getRoundStatus(rounds.round2, 2) === 'passed' && rounds.round2.announced,
                "bg-red-600/40 border-red-400/50": getRoundStatus(rounds.round2, 2) === 'failed' && rounds.round2.announced,
                "bg-orange-600/20 border-orange-400/30": getRoundStatus(rounds.round2, 2) === 'available' || (getRoundStatus(rounds.round2, 2) === 'passed' && !rounds.round2.announced),
                "bg-gray-600/20 border-gray-400/30": getRoundStatus(rounds.round2, 2) === 'locked'
              })}>
                <div className='flex flex-col items-center gap-4'>
                  <div className="p-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white backdrop-blur-md glow-purple">
                    <span className="text-3xl font-bold text-white">2</span>
                  </div>
                  <h3 className='text-2xl font-bold text-white'>Round 2: Coding</h3>
                  <p className='text-sm font-medium text-gray-300 text-center leading-relaxed'>
                    {getRoundMessage(rounds.round2, 2)}
                  </p>
                </div>
                {getRoundStatus(rounds.round2, 2) === 'locked' ? (
                  <button
                    disabled
                    className='bg-gray-500/30 text-gray-400 font-semibold py-3 px-6 rounded-xl cursor-not-allowed backdrop-blur-sm border border-gray-500/30'
                  >
                    Locked
                  </button>
                ) : getRoundStatus(rounds.round2, 2) === 'passed' || getRoundStatus(rounds.round2, 2) === 'failed' ? (
                  rounds.round2.announced ? (
                    <div className="text-center">
                      <div className="text-white text-lg font-bold mb-1">
                        {getRoundStatus(rounds.round2, 2) === 'passed' ? '✅ QUALIFIED!' : '❌ NOT QUALIFIED'}
                      </div>
                      <div className="text-gray-200 text-sm">
                        Results announced
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-orange-300 text-lg font-bold mb-1">
                        Round 2 Completed
                      </div>
                      <div className="text-gray-300 text-sm">
                        Waiting for results...
                      </div>
                    </div>
                  )
                ) : (
                  <button
                    onClick={() => handleStartRound(2)}
                    className='bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-500 hover:scale-105 shadow-xl glow-purple'
                  >
                    Start Round 2
                  </button>
                )}
              </div>

              {/* Round 3 */}
              <div className={classNames('p-8 rounded-3xl text-center glass-dark shadow-2xl w-full flex flex-col justify-center items-center gap-6 transition-all duration-500 hover:scale-105 hover:glow-purple', {
                "bg-green-600/40 border-green-400/50": getRoundStatus(rounds.round3, 3) === 'passed' && rounds.round3.announced,
                "bg-red-600/40 border-red-400/50": getRoundStatus(rounds.round3, 3) === 'failed' && rounds.round3.announced,
                "bg-orange-600/20 border-orange-400/30": getRoundStatus(rounds.round3, 3) === 'available' || (getRoundStatus(rounds.round3, 3) === 'passed' && !rounds.round3.announced),
                "bg-gray-600/20 border-gray-400/30": getRoundStatus(rounds.round3, 3) === 'locked'
              })}>
                <div className='flex flex-col items-center gap-4'>
                  <div className="p-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white backdrop-blur-md glow-purple">
                    <span className="text-3xl font-bold text-white">3</span>
                  </div>
                  <h3 className='text-2xl font-bold text-white'>Round 3: Final</h3>
                  <p className='text-sm font-medium text-gray-300 text-center leading-relaxed'>
                    {getRoundMessage(rounds.round3, 3)}
                  </p>
                </div>
                {getRoundStatus(rounds.round3, 3) === 'locked' ? (
                  <button
                    disabled
                    className='bg-gray-500/30 text-gray-400 font-semibold py-3 px-6 rounded-xl cursor-not-allowed backdrop-blur-sm border border-gray-500/30'
                  >
                    Locked
                  </button>
                ) : getRoundStatus(rounds.round3, 3) === 'passed' || getRoundStatus(rounds.round3, 3) === 'failed' ? (
                  rounds.round3.announced ? (
                    <div className="text-center">
                      <div className="text-white text-lg font-bold mb-1">
                        {getRoundStatus(rounds.round3, 3) === 'passed' ? '✅ SELECTED!' : '❌ NOT SELECTED'}
                      </div>
                      <div className="text-gray-200 text-sm">
                        Results announced
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-orange-300 text-lg font-bold mb-1">
                        Round 3 Completed
                      </div>
                      <div className="text-gray-300 text-sm">
                        Waiting for results...
                      </div>
                    </div>
                  )
                ) : (
                  <button
                    onClick={() => handleStartRound(3)}
                    className='bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-500 hover:scale-105 shadow-xl glow-purple'
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


      <Footer />
    </div>
  )
}

export default TeamPage
