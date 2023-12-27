var express = require("express")
var router = express.Router()

const { Prompt } = require("../db")

router.post("/today", async (req, res) => {
	try {
		const currentDate = new Date()
		currentDate.setHours(0, 0, 0, 0) // midnight

		const existingPrompt = await Prompt.findOne({
			createdAt: {
				$gte: currentDate,
				$lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000), // next day
			},
		})

		if (existingPrompt) {
			res.json({ prompt: existingPrompt })
		} else {
			// Create a new prompt for today
			const newPrompt = new Prompt({
				text: "This is a prompt",
				createdAt: new Date(),
			})

			const savedPrompt = await newPrompt.save()

			res.json({ prompt: savedPrompt })
		}
	} catch (error) {
		console.error("Error handling today's prompt:", error)
		res.status(500).json({ error: "Internal Server Error" })
	}
})

module.exports = router
