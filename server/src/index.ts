import express from "express"
import cors from "cors"
import { questions } from "./data/questions"

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.send("MET API Running 🚀")
})
    
app.get("/questions", (req, res) => {
  res.json(questions)
})

app.listen(3000, () => {
  console.log("Server running on port 3000")
})