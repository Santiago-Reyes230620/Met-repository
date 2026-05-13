type ButtonProps = {
  text: string
}

export default function Button({ text }: ButtonProps) {
  return (
    <button className="bg-blue-500 hover:bg-blue-600 transition px-6 py-3 rounded-xl font-semibold">
      {text}
    </button>
  )
}