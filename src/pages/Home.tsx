import { questions } from "../data/questions"
import { useState } from "react"
import Button from "../components/ui/Button"


export default function Home() {
    const [score,setScore] = useState(0)
    const [currentQuestion, setCurrentQuestion] = useState(0)

    const question = questions[currentQuestion]
   
     function handleAnswer(selectedOption: string) {
        if (selectedOption === question.correctAnswer) {
            setScore(score + 1)
        }
        setCurrentQuestion(currentQuestion + 1)
    }
  if (!question) {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <h1 className="text-5xl font-bold">
          Quiz Finished 🎉
        </h1>
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

          <h2 className="text-2xl font-bold">
            {question.question}
          </h2>

          <div className="text-2xl font-bold">
           {question.options.map((Option) =>(
            <button key={Option}
            className="block w-full bg-slate-800 hover:bg-slate-700 p-4 rounded-xl text-left"
            onClick={() => handleAnswer(Option)}
            >
             {Option}    
            </button>
           ))} 
          </div>

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