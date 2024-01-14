const express = require("express")
const { connectDB } = require("./db")
const { openaiTest } = require("./openai")
const axios = require("axios")
const cors = require("cors")
const cron = require("node-cron")
require("dotenv/config")

// Local Modules
const authRouter = require("./routes/auth.js")
const promptRouter = require("./routes/prompt.js")
const responseRouter = require("./routes/response.js")
const likeRouter = require("./routes/likes.js")
const commentRouter = require("./routes/comments.js")

// Server Initialization
const app = express()
const PORT = 8080

connectDB()
// openaiTest()

cron.schedule('0 4 * * *', () => {
	console.log('Initiating daily cleanup at 06:00 at America/New_York timezone');
  }, {
	timezone: "America/New_York"
  });

// cors configuration
app.use(cors())
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*")
	res.setHeader("Access-Control-Allow-Credentials", "true")
	res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE")
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
	)
	next()
})

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes will be written here
app.use("/auth", authRouter)
app.use("/prompts", promptRouter)
app.use("/responses", responseRouter)
app.use("/likes", likeRouter)
app.use("/comments", commentRouter)

// Server Listen Along with Database
// connection(in case of data persistence)
app.listen(PORT, (error) => {
	if (!error) console.log("Server is Successfully Running, and App is listening on port " + PORT)
	else console.log("Error occurred, server can't start", error)
})