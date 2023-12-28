var express = require("express")
var router = express.Router()

const { User, Response, Like } = require("../db")

// get all responses
router.get("/all", async (req, res) => {
	try {
		const responses = await Response.aggregate([
			{
				$lookup: { // from the likes collection get all documents with matching responseId
					from: "likes",
					localField: "_id",
					foreignField: "responseId",
					as: "likes",
				},
			},
			{
				$lookup: { // from the comments collection get all documents with matching responseId
					from: "comments",
					localField: "_id",
					foreignField: "responseId",
					as: "comments",
				},
			},
			{
				$project: {
					_id: 1,
					text: 1,
					numLikes: { $size: "$likes" },
					numComments: { $size: "$comments" },
					createdAt: 1,
				},
			},
		])

		res.json({ responses: responses })
	} catch (error) {
		console.error("Error fetching all responses:", error)
		res.status(500).json({ error: "Internal Server Error" })
	}
})

// create a new response
router.post("/create", async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email })
		if (!user) {
			return res.status(404).json({ error: "User not found" })
		}

		const existingResponse = await Response.findOne({
			userId: user._id,
			promptId: req.body.promptId,
		})

		if (existingResponse) {
			return res.status(400).json({ error: "User has already responded" })
		}

		const newResponse = new Response({
			userId: user._id,
			promptId: req.body.promptId,
			text: req.body.text,
			createdAt: new Date(),
		})
		const savedResponse = await newResponse.save()

		res.json({ response: savedResponse })
	} catch (error) {
		console.error("Error creating a new response:", error)
		res.status(500).json({ error: "Internal Server Error" })
	}
})

// like a response
router.post("/like", async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.emailn })
		if (!user) {
			return res.status(404).json({ error: "User not found" })
		}

		const response = await Response.findOne({ _id: req.body.responseId })
		if (!response) {
			return res.status(404).json({ error: "Response not found" })
		}

		const newLike = new Like({
			userId: user._id,
			responseId: response._id,
			createdAt: new Date(),
		})
		const savedLike = await newLike.save()

		res.json({ response: savedResponse })
	} catch (error) {
		console.error("Error liking a response:", error)
		res.status(500).json({ error: "Internal Server Error" })
	}
})

// unlike a response
router.post("/unlike", async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email })
		if (!user) {
			return res.status(404).json({ error: "User not found" })
		}

		const response = await Response.findOne({ _id: req.body.responseId })
		if (!response) {
			return res.status(404).json({ error: "Response not found" })
		}

		await Like.findOneAndRemove({ userId: user._id, responseId: response._id })
		const result = await Like.findOneAndRemove({ userId: user._id, responseId: response._id })
		if (!result) {
			res.json({ message: "Response not liked or already unliked" })
		} else {
			res.json({ message: "Response unliked successfully" })
		}
	} catch (error) {
		console.error("Error unliking a response:", error)
		res.status(500).json({ error: "Internal Server Error" })
	}
})

module.exports = router
