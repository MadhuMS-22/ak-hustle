import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import questionsData from './questions.json';
import competitionService from '../../services/competitionService';
import authService from '../../services/authService';

const AdminPage = ({ onGoBack }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showPrograms, setShowPrograms] = useState(false);

  // Maximum possible score (calculated from questions.json - 36 puzzle blocks total)
  const maxPossibleScore = 36;

  // Format time function
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Extract program for a specific question with highlighting
  const extractQuestionProgram = (team, questionIndex) => {
    if (!team.round3QuestionResults || !Array.isArray(team.round3QuestionResults)) {
      return { program: "No program data available for this question.", hasErrors: false };
    }

    const question = questionsData.questions[questionIndex];
    if (!question) {
      return { program: "Question not found.", hasErrors: false };
    }

    let program = "";
    let hasErrors = false;
    const codeBlocks = [];

    question.codeBlocks.forEach((block, blockIndex) => {
      if (block.isPuzzle) {
        // Find the selected answer for this block
        const selectedAnswer = team.round3QuestionResults.find(
          result => result.questionIndex === questionIndex && result.blockIndex === blockIndex
        );

        if (selectedAnswer && selectedAnswer.selectedAnswer) {
          const isCorrect = selectedAnswer.isCorrect;
          if (!isCorrect) hasErrors = true;

          codeBlocks.push({
            type: 'puzzle',
            code: selectedAnswer.selectedAnswer,
            isCorrect: isCorrect,
            blockIndex: blockIndex
          });
        } else {
          hasErrors = true;
          codeBlocks.push({
            type: 'puzzle',
            code: "// [Not answered]",
            isCorrect: false,
            blockIndex: blockIndex
          });
        }
      } else {
        // Static code block
        codeBlocks.push({
          type: 'static',
          code: block.code,
          isCorrect: true,
          blockIndex: blockIndex
        });
      }
    });

    return { codeBlocks, hasErrors };
  };

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/round3/scores');
        if (!response.ok) {
          throw new Error(`Failed to fetch scores: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched scores:', data);

        // Sort teams by: 1) Score (highest first), 2) Time (fastest first), 3) Questions solved in min time
        const sortedScores = data.sort((a, b) => {
          // Primary sort: Score (highest first)
          if (b.round3Score !== a.round3Score) {
            return (b.round3Score || 0) - (a.round3Score || 0);
          }

          // Secondary sort: Time (fastest first)
          if (a.round3Time !== b.round3Time) {
            return (a.round3Time || 0) - (b.round3Time || 0);
          }

          // If everything is equal, sort by date (most recent first)
          return new Date(b.round3SubmittedAt || 0) - new Date(a.round3SubmittedAt || 0);
        });

        setScores(sortedScores);
      } catch (err) {
        console.error('Error fetching scores:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, []);

  const handleViewPrograms = (team) => {
    setSelectedTeam(team);
    setShowPrograms(true);
  };

  const handleBackToList = () => {
    setShowPrograms(false);
    setSelectedTeam(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-gray-100 font-sans p-4 flex flex-col items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          Loading scores...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-gray-100 font-sans p-4 flex flex-col items-center justify-center">
        <div className="text-center text-red-500">
          <h2 className="text-2xl font-bold mb-4">Error Loading Admin Page</h2>
          <p className="mb-4">Error: {error}</p>
          <button
            onClick={onGoBack}
            className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white font-bold py-2 px-4 rounded-full transition duration-500 transform hover:scale-105 shadow-xl glow-purple"
          >
            Go Back to Game
          </button>
        </div>
      </div>
    );
  }

  if (showPrograms && selectedTeam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-gray-100 font-sans p-4 flex flex-col items-center">
        <div className="w-full max-w-6xl p-8 glass-dark rounded-xl shadow-2xl mt-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-6 bg-gradient-to-r from-white via-purple-300 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl">
            {selectedTeam.teamName} - All Programs
          </h1>

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-purple-900/30 px-4 py-2 rounded-full">
              <span className="text-purple-400 font-semibold">Question Order:</span>
              <span className="text-white font-bold">{selectedTeam.round3QuestionOrderName || 'Unknown'}</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Program by Question</h2>
            <div className="space-y-8">
              {(() => {
                // Get the question order for this team
                const teamOrder = questionsData.questionOrders.find(order => order.orderId === selectedTeam.round3QuestionOrder);
                const orderedQuestionIds = teamOrder ? teamOrder.questionIds : [1, 2, 3, 4, 5];

                return orderedQuestionIds.map((questionId, qIndex) => {
                  const question = questionsData.questions.find(q => q.id === questionId);
                  if (!question) return null;

                  // Extract the program for this specific question
                  const questionData = extractQuestionProgram(selectedTeam, qIndex);
                  const questionScore = selectedTeam.round3IndividualScores?.find(q => q.questionIndex === qIndex);

                  return (
                    <div key={qIndex} className="bg-gray-800 rounded-lg p-6 border border-gray-600">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-indigo-400 mb-2">
                            Question {qIndex + 1}: {question.title}
                          </h3>
                          <p className="text-gray-300 text-sm mb-2">{question.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-green-400">
                              Score: {questionScore?.score || 0} points
                            </span>
                            <span className="text-yellow-400">
                              Time: {questionScore?.timeTaken || 0}s
                            </span>
                            {questionData.hasErrors && (
                              <span className="text-red-400 flex items-center gap-1">
                                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                Has Errors
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${(questionScore?.score || 0) > 0 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                            }`}>
                            {(questionScore?.score || 0) > 0 ? 'Solved' : 'Not Solved'}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-900 p-4 rounded-lg border-l-4 border-indigo-500">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs text-gray-400 font-semibold">PROGRAM CODE:</span>
                          <div className="flex-1 h-px bg-gray-600"></div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded"></div>
                              <span className="text-green-400">Correct</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-red-500 rounded"></div>
                              <span className="text-red-400">Incorrect</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {questionData.codeBlocks?.map((block, blockIndex) => (
                            <div
                              key={blockIndex}
                              className={`p-2 rounded ${block.type === 'puzzle'
                                ? (block.isCorrect
                                  ? 'bg-green-900/30 border-l-2 border-green-500'
                                  : 'bg-red-900/30 border-l-2 border-red-500')
                                : 'bg-gray-800/50'
                                }`}
                            >
                              <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                <span className={block.type === 'puzzle' && !block.isCorrect ? 'text-red-300' : 'text-green-300'}>
                                  {block.code}
                                </span>
                                {block.type === 'puzzle' && !block.isCorrect && (
                                  <span className="text-red-400 text-xs ml-2">❌ Wrong Answer</span>
                                )}
                                {block.type === 'puzzle' && block.isCorrect && (
                                  <span className="text-green-400 text-xs ml-2">✅ Correct</span>
                                )}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleBackToList}
              className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white font-bold py-2 px-4 rounded-full transition duration-500 transform hover:scale-105 shadow-xl glow-purple"
            >
              Back to Teams
            </button>
            <button
              onClick={onGoBack}
              className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white font-bold py-2 px-4 rounded-full transition duration-500 transform hover:scale-105 shadow-xl glow-purple"
            >
              Go Back to Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 flex flex-col items-center">
      <div className="w-full max-w-7xl p-8 bg-gray-800 rounded-xl shadow-lg mt-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-6 text-indigo-400">
          Round 3 Admin Dashboard
        </h1>
        <p className="text-center mb-8 text-gray-300">
          Team Results and Scores
        </p>

        {scores && scores.length > 0 ? (
          <div className="space-y-6">
            {scores.map((score, index) => {
              const rank = index + 1;
              const questionsSolved = (score.round3IndividualScores || []).filter(q => q.score > 0).length;
              const percentage = Math.round(((score.round3Score || 0) / maxPossibleScore) * 100);

              return (
                <div key={score._id || index} className="bg-gray-700 rounded-lg p-6 relative">
                  {/* Ranking Badge */}
                  <div className="absolute -top-2 -left-2 w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black font-bold text-lg shadow-lg">
                    #{rank}
                  </div>

                  <div className="flex justify-between items-start mb-4">
                    <div className="ml-4">
                      <h2 className="text-2xl font-bold text-indigo-400">{score.teamName || 'Unknown Team'}</h2>
                      <p className="text-gray-300">Submitted: {score.round3SubmittedAt ? new Date(score.round3SubmittedAt).toLocaleString() : 'Unknown'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${(score.round3Score || 0) === maxPossibleScore ? 'bg-green-600 text-white' : 'bg-yellow-600 text-black'
                          }`}>
                          {(score.round3Score || 0) === maxPossibleScore ? 'Complete' : 'Partial'}
                        </span>
                        <span className="text-sm text-gray-400">
                          {score.round3Score || 0}/{maxPossibleScore} points ({percentage}%)
                        </span>
                        <span className="text-sm text-blue-400">
                          {questionsSolved}/5 questions solved
                        </span>
                        <span className="text-sm text-purple-400 bg-purple-900/30 px-2 py-1 rounded">
                          Order: {score.round3QuestionOrderName || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-400">Score: {score.round3Score || 0}</p>
                      <p className="text-lg text-yellow-400">Time: {formatTime(score.round3Time || 0)}</p>
                      <p className="text-sm text-gray-400">Rank #{rank}</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleViewPrograms(score)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 transform hover:scale-105"
                    >
                      View All Programs
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 text-xl">No team scores recorded yet.</p>
          </div>
        )}

        <div className="flex justify-center mt-8">
          <button
            onClick={onGoBack}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 transform hover:scale-105"
          >
            Go Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};

const QuestionComponent = ({ question, questionIndex, selectedAnswers, onAnswerClick, quizComplete, showValidation }) => {
  const getBlockColor = (blockIndex, option) => {
    const answerKey = `${questionIndex}-${blockIndex}`;
    const isSelected = selectedAnswers[answerKey] === option;
    if (isSelected) {
      return 'bg-blue-600 border-2 border-blue-400';
    }
    return 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent';
  };

  const isBlockAnswered = (blockIndex) => {
    const answerKey = `${questionIndex}-${blockIndex}`;
    return !!selectedAnswers[answerKey];
  };

  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold text-indigo-400 mb-4">
        Question {questionIndex + 1}: {question.title}
      </h3>
      <p className="text-gray-300 mb-4">{question.description}</p>

      <div className="grid grid-cols-1 gap-4">
        {question.codeBlocks.map((block, blockIndex) => (
          <div key={blockIndex}>
            {block.isPuzzle ? (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {block.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`
                        p-3 rounded-md cursor-pointer transition-all duration-200
                        ${getBlockColor(blockIndex, option)}
                        ${showValidation && !isBlockAnswered(blockIndex) ? 'ring-2 ring-red-400 ring-opacity-50' : ''}
                      `}
                      onClick={() => onAnswerClick(questionIndex, blockIndex, option)}
                    >
                      <pre className="whitespace-pre-wrap text-sm font-mono overflow-x-auto">
                        <code>{option.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="bg-gray-900 rounded-md p-3 shadow-inner">
                  <pre className="whitespace-pre-wrap text-sm font-mono overflow-x-auto">
                    <code>{block.code}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Round3Page = () => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [questionTimes, setQuestionTimes] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isViewingAdmin, setIsViewingAdmin] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [showValidation, setShowValidation] = useState(false);
  const [questionOrder, setQuestionOrder] = useState(null);
  const [orderedQuestions, setOrderedQuestions] = useState([]);

  const questions = questionsData.questions;

  // Get team name from localStorage
  useEffect(() => {
    const storedTeam = localStorage.getItem('hustle_team');
    if (storedTeam) {
      const teamData = JSON.parse(storedTeam);
      setTeamName(teamData.teamName || 'Unknown Team');
    }
  }, []);

  // Get question order and create ordered questions array
  const getQuestionOrder = () => {
    if (questionOrder) {
      return questionOrder;
    }
    // Randomly select one of the 5 question orders
    const randomOrderIndex = Math.floor(Math.random() * questionsData.questionOrders.length);
    const selectedOrder = questionsData.questionOrders[randomOrderIndex];
    setQuestionOrder(selectedOrder);
    return selectedOrder;
  };

  // Get ordered questions based on the selected order
  const getOrderedQuestions = () => {
    if (orderedQuestions.length > 0) {
      return orderedQuestions;
    }
    const order = getQuestionOrder();
    const ordered = order.questionIds.map(id =>
      questions.find(q => q.id === id)
    ).filter(Boolean);
    setOrderedQuestions(ordered);
    return ordered;
  };

  // Initialize ordered questions list
  const orderedQuestionsList = getOrderedQuestions();
  const currentQuestion = orderedQuestionsList && orderedQuestionsList[currentQuestionIndex];

  // Maximum possible score (36 puzzle blocks total across all 5 questions)
  const maxPossibleScore = 36;

  useEffect(() => {
    let interval = null;
    if (quizStarted && !quizComplete && currentQuestion) {
      setTimer(currentQuestion.timeLimit);
      setStartTime(Date.now());

      interval = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer <= 1) {
            clearInterval(interval);
            // Auto-save incomplete quiz when timer expires
            handleIncompleteQuiz();
            handleNextQuestion();
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, quizComplete, currentQuestionIndex]);

  // Auto-save when user tries to leave the page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (quizStarted && !quizComplete) {
        handleIncompleteQuiz();
        e.preventDefault();
        e.returnValue = 'Your quiz progress will be saved. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [quizStarted, quizComplete]);

  const handleStartQuiz = () => {
    if (!teamName.trim()) {
      setFeedbackMessage('Please enter a team name before starting the quiz.');
      return;
    }

    // Initialize question order and ordered questions
    getQuestionOrder();
    getOrderedQuestions();

    setQuizStarted(true);
    setQuizComplete(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuestionTimes({});
    setTotalScore(0);
    setFeedbackMessage('');
    setStartTime(Date.now());
  };

  const handleAnswerClick = (questionIndex, blockIndex, option) => {
    if (!quizStarted || quizComplete) return;

    const answerKey = `${questionIndex}-${blockIndex}`;
    setSelectedAnswers({
      ...selectedAnswers,
      [answerKey]: option,
    });

    // Clear validation state when user answers a question
    if (showValidation) {
      setShowValidation(false);
      setFeedbackMessage('');
    }
  };

  const handleNextQuestion = () => {
    // Check if all puzzle blocks in current question are answered
    const currentQuestion = orderedQuestionsList && orderedQuestionsList[currentQuestionIndex];
    if (!currentQuestion) {
      setFeedbackMessage('Error: Question not found. Please refresh and try again.');
      return;
    }

    const unansweredBlocks = currentQuestion.codeBlocks.filter((block, blockIndex) => {
      if (block.isPuzzle) {
        const answerKey = `${currentQuestionIndex}-${blockIndex}`;
        return !selectedAnswers[answerKey];
      }
      return false;
    });

    if (unansweredBlocks.length > 0) {
      setShowValidation(true);
      setFeedbackMessage(`Please answer all puzzle blocks in Question ${currentQuestionIndex + 1} before proceeding.`);
      return;
    }

    // Save time for current question
    const timeTaken = currentQuestion.timeLimit - timer;
    setQuestionTimes({
      ...questionTimes,
      [currentQuestionIndex]: timeTaken
    });

    if (currentQuestionIndex < orderedQuestionsList.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setFeedbackMessage(''); // Clear any previous messages
      setShowValidation(false); // Reset validation state
    } else {
      handleQuizCompletion();
    }
  };

  // Auto-save function for incomplete quizzes
  const handleIncompleteQuiz = async () => {
    if (!teamName.trim()) return;

    // Calculate current score with whatever answers we have
    let currentScore = 0;
    const questionResults = [];
    const individualQuestionScores = [];
    let selectedProgram = '';

    orderedQuestionsList.forEach((question, qIndex) => {
      let questionScore = 0;
      let questionTime = questionTimes[qIndex] || 0;

      question.codeBlocks.forEach((block, bIndex) => {
        if (block.isPuzzle) {
          const answerKey = `${qIndex}-${bIndex}`;
          const selectedAnswer = selectedAnswers[answerKey];
          const isCorrect = selectedAnswer && selectedAnswer.isCorrect;

          if (isCorrect) {
            currentScore++;
            questionScore++;
          }

          questionResults.push({
            questionIndex: qIndex,
            blockIndex: bIndex,
            selectedAnswer: selectedAnswer ? selectedAnswer.code : '',
            isCorrect: isCorrect,
            timeTaken: questionTime
          });

          if (selectedAnswer) {
            selectedProgram += selectedAnswer.code + '\n';
          }
        } else {
          selectedProgram += block.code + '\n';
        }
      });

      individualQuestionScores.push({
        questionIndex: qIndex,
        score: questionScore,
        timeTaken: questionTime
      });
    });

    const totalTimeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      await competitionService.submitRound3({
        score: currentScore,
        timeTaken: totalTimeTaken,
        selectedProgram: selectedProgram,
        questionOrder: questionOrder.orderId,
        questionOrderName: questionOrder.name,
        questionResults: questionResults,
        individualQuestionScores: individualQuestionScores
      });
      console.log('Incomplete quiz auto-saved successfully');
    } catch (error) {
      console.error('Error auto-saving incomplete quiz:', error);
    }
  };

  const handleQuizCompletion = async () => {
    // Calculate final score
    let newScore = 0;
    const questionResults = [];
    const individualQuestionScores = [];
    let selectedProgram = '';

    orderedQuestionsList.forEach((question, qIndex) => {
      let questionScore = 0;
      let questionTime = questionTimes[qIndex] || 0;

      question.codeBlocks.forEach((block, bIndex) => {
        if (block.isPuzzle) {
          const answerKey = `${qIndex}-${bIndex}`;
          const selectedAnswer = selectedAnswers[answerKey];
          const isCorrect = selectedAnswer && selectedAnswer.isCorrect;

          if (isCorrect) {
            newScore++;
            questionScore++;
          }

          questionResults.push({
            questionIndex: qIndex,
            blockIndex: bIndex,
            selectedAnswer: selectedAnswer ? selectedAnswer.code : '',
            isCorrect: isCorrect,
            timeTaken: questionTime
          });

          if (selectedAnswer) {
            selectedProgram += selectedAnswer.code + '\n';
          }
        } else {
          selectedProgram += block.code + '\n';
        }
      });

      individualQuestionScores.push({
        questionIndex: qIndex,
        score: questionScore,
        timeTaken: questionTime
      });
    });

    setTotalScore(newScore);
    setQuizComplete(true);

    const totalTimeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      await competitionService.submitRound3({
        score: newScore,
        timeTaken: totalTimeTaken,
        selectedProgram: selectedProgram,
        questionOrder: questionOrder.orderId,
        questionOrderName: questionOrder.name,
        questionResults: questionResults,
        individualQuestionScores: individualQuestionScores
      });

      setFeedbackMessage('Your responses have been successfully submitted!');
    } catch (error) {
      console.error('Error saving score:', error);
      setFeedbackMessage('An error occurred while submitting. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (isViewingAdmin) {
    return <AdminPage onGoBack={() => setIsViewingAdmin(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-6xl p-8 bg-gray-800 rounded-xl shadow-lg">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-indigo-400">
          Round 3: CODE RUSH
        </h1>
        <p className="text-xl text-center mb-8 text-gray-300">
          Complete 5 C programming puzzles. Each question has a 5-minute timer.
        </p>

        {!quizStarted ? (
          <div className="text-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">C Code Puzzle Game</h2>
              <p className="text-lg text-gray-300 mb-6">
                Test your C programming skills with 5 challenging puzzles!
              </p>
              <div className="bg-gray-700 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-bold text-indigo-400 mb-4">Game Rules:</h3>
                <ul className="text-left text-gray-300 space-y-2">
                  <li>• Complete 5 different C programming puzzles</li>
                  <li>• Each question has a 5-minute time limit</li>
                  <li>• Select the correct code blocks to complete each program</li>
                  <li>• Your progress and answers will be saved automatically</li>
                </ul>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-2 text-gray-300">
                Team Name: {teamName}
              </label>
              {feedbackMessage && (
                <p className="text-red-400 mt-2">{feedbackMessage}</p>
              )}
            </div>
            <p className="mb-4 text-xl">Ready to start? Each question has {formatTime(300)} to solve. Good luck!</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleStartQuiz}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 transform hover:scale-105"
              >
                Start Quiz
              </button>
            </div>
          </div>
        ) : !quizComplete ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="text-2xl font-bold">
                Question {currentQuestionIndex + 1} of {orderedQuestionsList ? orderedQuestionsList.length : 0}
              </div>
              <div className="text-2xl font-bold">
                Time Remaining: {formatTime(timer)}
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex justify-center space-x-2">
                {orderedQuestionsList && orderedQuestionsList.map((_, index) => {
                  const hasAnswer = Object.keys(selectedAnswers).some(key => key.startsWith(`${index}-`));
                  const isCurrent = index === currentQuestionIndex;
                  const isCompleted = index < currentQuestionIndex;

                  return (
                    <div
                      key={index}
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${isCurrent ? 'bg-blue-600 text-white' :
                          isCompleted ? 'bg-green-600 text-white' :
                            hasAnswer ? 'bg-yellow-500 text-black' :
                              'bg-gray-600 text-gray-300'}
                      `}
                    >
                      {index + 1}
                    </div>
                  );
                })}
              </div>
              <div className="text-center mt-2 text-sm text-gray-400">
                {Object.keys(selectedAnswers).filter(key => key.startsWith(`${currentQuestionIndex}-`)).length > 0
                  ? 'Answered' : 'Not Answered'}
              </div>
            </div>

            {/* Validation Message */}
            {feedbackMessage && (
              <div className="mb-4 p-3 bg-red-800 border border-red-600 rounded-lg">
                <p className="text-red-200 text-center">{feedbackMessage}</p>
              </div>
            )}

            {currentQuestion && (
              <QuestionComponent
                question={currentQuestion}
                questionIndex={currentQuestionIndex}
                selectedAnswers={selectedAnswers}
                onAnswerClick={handleAnswerClick}
                quizComplete={quizComplete}
                showValidation={showValidation}
              />
            )}

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={handleNextQuestion}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 transform hover:scale-105"
              >
                Next Question
              </button>
              <button
                onClick={handleQuizCompletion}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 transform hover:scale-105"
              >
                Finish Quiz
              </button>
            </div>

            {/* Auto-save warning */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400">
                💾 Your progress is automatically saved. If you don't finish, your current answers will be recorded.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="bg-gray-700 p-8 rounded-lg mb-6">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold mb-4 text-green-400">Quiz Submitted Successfully!</h2>
              <p className="text-xl text-gray-300 mb-6">
                Thank you, <span className="text-indigo-400 font-semibold">{teamName}</span>! Your responses have been recorded.
              </p>
              <div className="bg-green-800 border border-green-600 rounded-lg p-4 mb-6">
                <p className="text-green-200 font-semibold">
                  🎉 Your quiz has been successfully submitted and saved to the database.
                </p>
                <p className="text-green-300 text-sm mt-2">
                  Results will be available on the admin dashboard.
                </p>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => navigate('/team')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 transform hover:scale-105"
                >
                  Go Back to Home Page
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Round3Page;
