var express = require("express")
var router = express.Router()

const { User, Response } = require("../db")

// comment on a response
// TODO: implement OpenAI API for comment moderation
router.post("/create", async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email })
		if (!user) {
			return res.status(404).json({ error: "User not found" })
		}

		const response = await Response.findOne({ _id: req.body.responseId })
		if (!response) {
			return res.status(404).json({ error: "Response not found" })
		}

		const newComment = new Comment({
			userId: user._id,
			responseId: response._id,
            text: req.body.text,
			createdAt: new Date(),
		})
		const savedLike = await newLike.save()

		res.json({ response: savedResponse })
	} catch (error) {
		console.error("Error commenting on a response:", error)
		res.status(500).json({ error: "Internal Server Error" })
	}
})

module.exports = router
