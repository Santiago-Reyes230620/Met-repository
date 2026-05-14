type QuestionCardProps = {
  question: string
  options: string[]
  selectedAnswer: string
  correctAnswer: string
  onAnswer: (option: string) => void
}


export default function QuestionCard({
  question,
  options,
  selectedAnswer,
  correctAnswer,
  onAnswer,
}: QuestionCardProps) {
  return (
    <div className="space-y-6">

      <h2 className="text-2xl font-bold">
        {question}
      </h2>

      <div className="space-y-4">
        {options.map((option) => (
          <button
            key={option}
            disabled={!!selectedAnswer}
            onClick={() => onAnswer(option)}
            className={`block w-full p-4 rounded-xl text-left transition ${
              selectedAnswer
                ? option === correctAnswer
                  ? "bg-green-600 text-white"
                  : option === selectedAnswer
                  ? "bg-red-600 text-white"
                  : "bg-slate-800"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

    </div>
  )
}

