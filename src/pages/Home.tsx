import { useState, useEffect } from "react"
import Button from "../components/ui/Button"
import QuestionCard from "../components/quiz/questionCard"


type Question = {
  id: number
  question: string
  options: string[]
  correctAnswer: string
  category: string
  difficulty: string
}
export default function Home() {

  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
const [error, setError] = useState("")
  const [score, setScore] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [wrongAnswers, setWrongAnswers] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [timeLeft, setTimeLeft] = useState(15)
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredQuestions =
    selectedCategory === "All"
      ? questions
      : questions.filter((q) => q.category === selectedCategory)

  const question = filteredQuestions[currentQuestion] || null

  const progress =
    ((currentQuestion + 1) / filteredQuestions.length) * 100

  const categories = [
    "All",
    ...new Set(questions.map((q) => q.category)),
  ]

 useEffect(() => {

  async function fetchQuestions() {

    try {

      setLoading(true)

      const response = await fetch("http://localhost:3000/questions")

      if (!response.ok) {
        throw new Error("Failed to fetch questions")
      }

      const data = await response.json()

      setQuestions(data)

    } catch (error) {

      setError("Could not load questions")

      console.log(error)

    } finally {

      setLoading(false)

    }

  }

  fetchQuestions()

}, [])

  useEffect(() => {

    if (!question) return

    const timer = setTimeout(() => {

      if (timeLeft <= 1) {

        setCurrentQuestion((prev) => prev + 1)
        setSelectedAnswer("")
        setIsCorrect(null)
        setTimeLeft(15)

      } else {

        setTimeLeft((prev) => prev - 1)

      }

    }, 1000)

    return () => clearTimeout(timer)

  }, [timeLeft, question])

  function handleAnswer(selectedOption: string) {

    setSelectedAnswer(selectedOption)

    if (selectedOption === question.correctAnswer) {

      setIsCorrect(true)
      setScore((prev) => prev + 1)

    } else {

      setIsCorrect(false)
      setWrongAnswers((prev) => prev + 1)

    }

    setTimeout(() => {

      setCurrentQuestion((prev) => prev + 1)
      setSelectedAnswer("")
      setIsCorrect(null)
      setTimeLeft(15)

    }, 1500)

  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <h1 className="text-4xl font-bold">
          Loading Questions...
        </h1>
      </main>
    )
  }

  if (error) {
    return (
       <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <h1 className="text-4xl font-bold text-red-400">
          {error}
        </h1>
      </main>
    )
  }

  if (!question) {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-6">

          <h1 className="text-5xl font-bold">
            Quiz Finished 🎉
          </h1>

          <p className="text-2xl text-slate-300">
            Final Score: {score} / {filteredQuestions.length}
          </p>

          <p className="text-xl text-red-400">
            Wrong Answers: {wrongAnswers}
          </p>

          <p className="text-xl text-green-400">
            Accuracy: {Math.round((score / filteredQuestions.length) * 100)}%
          </p>

          <button
            onClick={() => {
              setCurrentQuestion(0)
              setScore(0)
              setWrongAnswers(0)
              setSelectedAnswer("")
              setIsCorrect(null)
              setTimeLeft(15)
            }}
            className="bg-blue-500 hover:bg-blue-600 transition px-6 py-3 rounded-xl font-semibold"
          >
            Restart Quiz
          </button>

        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white">

      <section className="max-w-5xl mx-auto px-6 py-20">

        <div className="space-y-6">

          <span className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm">
            Michigan English Test
          </span>

          <h1 className="text-5xl font-bold leading-tight">
            Practice English in a smarter way
          </h1>

          <p className="text-slate-300 text-lg max-w-2xl">
            Improve your grammar, reading, listening and speaking skills with interactive MET exercises.
          </p>

          <div className="space-y-2">

            <div className="flex justify-between text-sm text-slate-400">

              <span>Progress</span>

              <span>{Math.round(progress)}%</span>

            </div>

            <div className="w-full bg-slate-800 rounded-full h-3">

              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />

            </div>

          </div>

          <div className="flex gap-3 flex-wrap">

            {categories.map((category) => (

              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category)
                  setCurrentQuestion(0)
                  setScore(0)
                  setWrongAnswers(0)
                }}
                className={`px-4 py-2 rounded-full transition ${
                  selectedCategory === category
                    ? "bg-blue-500 text-white"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                {category}
              </button>

            ))}

          </div>

          <div className="flex gap-3">

            <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm">
              {question.category}
            </span>

            <span className="bg-orange-500/20 text-orange-300 px-4 py-2 rounded-full text-sm">
              {question.difficulty}
            </span>

            <span className="bg-red-500/20 text-red-300 px-4 py-2 rounded-full text-sm">
              ⏰ {timeLeft}s
            </span>

          </div>

          <QuestionCard
            question={question.question}
            options={question.options}
            selectedAnswer={selectedAnswer}
            correctAnswer={question.correctAnswer}
            onAnswer={handleAnswer}
          />

          {isCorrect === true && (
            <p className="text-green-400 font-bold text-xl">
              Correct!
            </p>
          )}

          {isCorrect === false && (
            <div className="space-y-2">

              <p className="text-red-400 font-bold text-xl">
                Incorrect!
              </p>

              <p className="text-slate-300">
                The correct answer is:
                <span className="text-green-400 font-bold ml-2">
                  {question.correctAnswer}
                </span>
              </p>

            </div>
          )}

          <h2 className="text-3xl font-bold">
            Your Score: {score}
          </h2>

          <div className="flex gap-4">
            <Button text="View Progress" />
          </div>

        </div>

      </section>

    </main>
  )
}