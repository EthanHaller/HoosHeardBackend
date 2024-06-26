var express = require("express")
var router = express.Router()

const { User, Response, Comment } = require("../db")
const { moderate } = require("../openai")

// get all comments by responseID
router.get("/:responseId", async (req, res) => {
	try {
		const responseId = req.params.responseId
		const { page } = req.query;
        const limit = 10;
        const skip = (page - 1) * limit;

		const comments = await Comment.find({ responseId: responseId })
			.populate("userId", "_id")
			.sort({ createdAt: "asc" })
			.skip(skip)
			.limit(limit)

		res.json({ comments: comments })
	} catch (error) {
		console.error("Error fetching comments by responseID:", error)
		res.status(500).json({ error: "Internal Server Error" })
	}
})

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

		const moderation = await moderate(req.body.text)
		const flagged = moderation.results[0].flagged

		if (flagged) {
			return res.status(403).json({ flagged: true, error: "Comment flagged for harmful content" })
		}

		const newComment = new Comment({
			userId: user._id,
			responseId: response._id,
			text: req.body.text,
			createdAt: new Date(),
		})
		const savedComment = await newComment.save()

		res.json({ comment: savedComment })
	} catch (error) {
		console.error("Error commenting on a response:", error)
		res.status(500).json({ error: "Internal Server Error" })
	}
})

module.exports = router
