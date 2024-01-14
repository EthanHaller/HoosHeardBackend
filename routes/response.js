var express = require("express")
const mongoose = require("mongoose")
var router = express.Router()

const { User, Response } = require("../db")

// get all responses
router.get("/:userId", async (req, res) => {
	try {
		const userId = new mongoose.Types.ObjectId(req.params.userId)

		const responses = await Response.aggregate([
			{
				$lookup: {
					from: "likes",
					localField: "_id",
					foreignField: "responseId",
					as: "likes",
				},
			},
			{
				$lookup: {
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
					likedByUser: {
						$in: [userId, "$likes.userId"],
					},
				},
			},
		])

		res.json({ responses: responses })
	} catch (error) {
		console.error("Error fetching all responses:", error)
		res.status(500).json({ error: "Internal Server Error" })
	}
})

// get a response by ID
router.get("/one/:userId/:id", async (req, res) => {
	try {
		const responseId = new mongoose.Types.ObjectId(req.params.id)
		const userId = new mongoose.Types.ObjectId(req.params.userId)

		const response = await Response.aggregate([
			{
				$match: {
					_id: responseId,
				},
			},
			{
				$lookup: {
					from: "likes",
					localField: "_id",
					foreignField: "responseId",
					as: "likes",
				},
			},
			{
				$lookup: {
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
					likedByUser: {
						$in: [userId, "$likes.userId"],
					},
				},
			},
		])

		if (response.length === 0) {
			return res.status(404).json({ error: "Response not found" })
		}

		res.json({ response: response[0] })
	} catch (error) {
		console.error("Error fetching response by ID:", error)
		res.status(500).json({ error: "Internal Server Error" })
	}
})

// create a new response
// TODO: implement OpenAI API for response moderation
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

module.exports = router
