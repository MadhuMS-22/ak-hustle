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
    fetchTeamData(contextTeamData._id, true)
  }, [isAuthenticated, contextTeamData, navigate, authLoading])

  // Fetch team data from backend
  const fetchTeamData = async (teamId, showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true)
      }

      // Fetch team details with current status
      const teamResponse = await apiService.get(`/competition/team/${teamId}`)
      if (teamResponse.success) {
        const team = teamResponse.data.team

        // Only update if data has actually changed
        if (!teamData || JSON.stringify(team) !== JSON.stringify(teamData)) {
          setTeamData(team)

          // Determine round statuses based on competition status and results announcement
          const updatedRounds = {
            round1: {
              status: team.competitionStatus === 'Registered' ? 'pending' :
                team.competitionStatus === 'Round1' ? 'available' :
                  ['Round2', 'Round3', 'Selected', 'Eliminated'].includes(team.competitionStatus) ? 'completed' : 'locked',
              result: (team.resultsAnnounced && team.competitionStatus !== 'Registered' && team.competitionStatus !== 'Round1') ?
                (['Round2', 'Round3', 'Selected'].includes(team.competitionStatus) ? true : false) : null,
              score: team.scores?.round1 || null,
              announced: team.resultsAnnounced || false,
              qualified: (team.resultsAnnounced && team.competitionStatus !== 'Registered' && team.competitionStatus !== 'Round1') ?
                (['Round2', 'Round3', 'Selected'].includes(team.competitionStatus) ? true : false) : null
            },
            round2: {
              status: team.competitionStatus === 'Round2' ? 'available' :
                team.competitionStatus === 'Round3' && !team.resultsAnnounced ? 'completed' :
                  team.competitionStatus === 'Round3' && team.resultsAnnounced ? 'completed' :
                    team.competitionStatus === 'Selected' ? 'completed' :
                      team.competitionStatus === 'Eliminated' ? 'completed' : 'locked',
              result: (team.resultsAnnounced && team.competitionStatus !== 'Round2') ?
                (['Round3', 'Selected'].includes(team.competitionStatus) ? true : false) : null,
              score: team.scores?.round2 || null,
              announced: team.resultsAnnounced || false,
              qualified: (team.resultsAnnounced && team.competitionStatus !== 'Round2') ?
                (['Round3', 'Selected'].includes(team.competitionStatus) ? true : false) : null
            },
            round3: {
              status: team.competitionStatus === 'Round3' ? 'available' :
                team.competitionStatus === 'Selected' ? 'completed' :
                  team.competitionStatus === 'Eliminated' ? 'completed' : 'locked',
              result: (team.resultsAnnounced && team.competitionStatus !== 'Round3') ?
                (team.competitionStatus === 'Selected' ? true : false) : null,
              score: team.scores?.round3 || null,
              announced: team.resultsAnnounced || false,
              qualified: (team.resultsAnnounced && team.competitionStatus !== 'Round3') ?
                (team.competitionStatus === 'Selected' ? true : false) : null
            }
          }

          setRounds(updatedRounds)
        }
      }

      // Fetch round codes for verification (only if not already loaded)
      if (!roundCodes.round2 || !roundCodes.round3) {
        const codesResponse = await apiService.get('/competition/round-codes')
        if (codesResponse.success) {
          setRoundCodes(codesResponse.data.roundCodes)
        }
      }

    } catch (error) {
      console.error('Error fetching team data:', error)
      // Fallback to localStorage data if API fails
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  // Set up real-time updates
  useEffect(() => {
    if (teamData?._id) {
      // Only poll if team is in an active state (not completed/eliminated)
      const shouldPoll = teamData.competitionStatus &&
        !['Selected', 'Eliminated'].includes(teamData.competitionStatus)

      if (shouldPoll) {
        // Poll for updates every 30 seconds to catch admin changes
        const interval = setInterval(() => {
          fetchTeamData(teamData._id, false)
        }, 30000)

        return () => clearInterval(interval)
      }
    }
  }, [teamData?._id, teamData?.competitionStatus])

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
    // If round is completed, check if it's passed or failed
    if (round.status === 'completed') {
      // If results are not announced yet, return 'pending' to show waiting message
      if (!round.announced) {
        return 'pending'
      }
      // If results are announced, check if passed or failed
      return round.result ? 'passed' : 'failed'
    }
    // If round is available, return available
    else if (round.status === 'available') {
      return 'available'
    }
    // If round is pending (only for Round 1), return pending
    else if (round.status === 'pending') {
      return 'pending'
    }
    // Otherwise, it's locked
    else {
      return 'locked'
    }
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
        if (roundNumber === 1) {
          return `You are registered. Waiting for Round 1 to start.`
        } else {
          return `Round ${roundNumber} completed. Waiting for results to be announced.`
        }
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
                "bg-green-600/40 border-green-400/50": rounds.round1.status === 'completed' && rounds.round1.result === true && rounds.round1.announced,
                "bg-red-600/40 border-red-400/50": rounds.round1.status === 'completed' && rounds.round1.result === false && rounds.round1.announced,
                "bg-orange-600/20 border-orange-400/30": rounds.round1.status === 'pending' || rounds.round1.status === 'available' || (rounds.round1.status === 'completed' && !rounds.round1.announced),
                "bg-gray-600/20 border-gray-400/30": rounds.round1.status === 'locked'
              })}>
                <div className='flex flex-col items-center gap-4'>
                  <div className="p-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white backdrop-blur-md glow-purple">
                    <span className="text-3xl font-bold text-white">1</span>
                  </div>
                  <h3 className='text-2xl font-bold text-white'>Round 1: Aptitude</h3>
                  <p className='text-sm font-medium text-gray-300 text-center leading-relaxed'>
                    {rounds.round1.status === 'pending' ? 'You are registered. Waiting for Round 1 to start.' :
                      rounds.round1.status === 'available' ? 'You are in Round 1. Please complete your task.' :
                        rounds.round1.status === 'completed' && !rounds.round1.announced ? 'Round 1 completed. Waiting for results to be announced.' :
                          rounds.round1.status === 'completed' && rounds.round1.announced ?
                            (rounds.round1.result === true ? 'Congratulations! You qualified for Round 2! Results have been announced.' : 'Round 1 completed. Better luck next time! Results have been announced.') :
                            'Locked. Complete previous round to unlock.'}
                  </p>
                </div>
                {rounds.round1.status === 'completed' && rounds.round1.announced ? (
                  <div className="text-center">
                    <div className="text-white text-lg font-bold mb-1">
                      {rounds.round1.result === true ? '✅ QUALIFIED!' : '❌ NOT QUALIFIED'}
                    </div>
                    <div className="text-gray-200 text-sm">
                      Results announced
                    </div>
                  </div>
                ) : rounds.round1.status === 'available' ? (
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
                    {rounds.round1.status === 'pending' ? 'Waiting...' : 'Locked'}
                  </button>
                )}
              </div>

              {/* Round 2 */}
              <div className={classNames('p-8 rounded-3xl text-center glass-dark shadow-2xl w-full flex flex-col justify-center items-center gap-6 transition-all duration-500 hover:scale-105 hover:glow-blue', {
                "bg-green-600/40 border-green-400/50": rounds.round2.status === 'completed' && rounds.round2.result === true && rounds.round2.announced,
                "bg-red-600/40 border-red-400/50": rounds.round2.status === 'completed' && rounds.round2.result === false && rounds.round2.announced,
                "bg-orange-600/20 border-orange-400/30": rounds.round2.status === 'available' || (rounds.round2.status === 'completed' && !rounds.round2.announced),
                "bg-gray-600/20 border-gray-400/30": rounds.round2.status === 'locked'
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
                {rounds.round2.status === 'locked' ? (
                  <button
                    disabled
                    className='bg-gray-500/30 text-gray-400 font-semibold py-3 px-6 rounded-xl cursor-not-allowed backdrop-blur-sm border border-gray-500/30'
                  >
                    Locked
                  </button>
                ) : rounds.round2.status === 'completed' ? (
                  rounds.round2.announced ? (
                    <div className="text-center">
                      <div className="text-white text-lg font-bold mb-1">
                        {rounds.round2.result === true ? '✅ QUALIFIED!' : '❌ NOT QUALIFIED'}
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
                "bg-green-600/40 border-green-400/50": rounds.round3.status === 'completed' && rounds.round3.result === true && rounds.round3.announced,
                "bg-red-600/40 border-red-400/50": rounds.round3.status === 'completed' && rounds.round3.result === false && rounds.round3.announced,
                "bg-orange-600/20 border-orange-400/30": rounds.round3.status === 'available' || (rounds.round3.status === 'completed' && !rounds.round3.announced),
                "bg-gray-600/20 border-gray-400/30": rounds.round3.status === 'locked'
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
                {rounds.round3.status === 'locked' ? (
                  <button
                    disabled
                    className='bg-gray-500/30 text-gray-400 font-semibold py-3 px-6 rounded-xl cursor-not-allowed backdrop-blur-sm border border-gray-500/30'
                  >
                    Locked
                  </button>
                ) : rounds.round3.status === 'completed' ? (
                  rounds.round3.announced ? (
                    <div className="text-center">
                      <div className="text-white text-lg font-bold mb-1">
                        {rounds.round3.result === true ? '✅ SELECTED!' : '❌ NOT SELECTED'}
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
