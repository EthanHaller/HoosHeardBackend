var express = require("express")
const mongoose = require("mongoose")
var router = express.Router()

const { User, Response } = require("../db")
const { moderate } = require("../openai")

// get responses with pagination and sorting
router.get("/:userId", async (req, res) => {
	try {
		const userId = new mongoose.Types.ObjectId(req.params.userId)
		const { page, sort } = req.query
		const limit = 10
		const skip = (parseInt(page) - 1) * limit

		const responses = await Response.aggregate([
			{
				$match: { userId: { $ne: userId } },
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
			{
				$skip: skip,
			},
			{
				$limit: limit,
			},
			{
				$sort: sort === "recent" ? { createdAt: -1 } : { numLikes: -1 },
			},
		])
		res.json({ responses })
	} catch (error) {
		console.error("Error fetching responses:", error)
		res.status(500).json({ error: "Internal Server Error" })
	}
})

//get a response for a user
router.get("/mine/:userId", async (req, res) => {
	try {
		const userId = new mongoose.Types.ObjectId(req.params.userId)
		const responses = await Response.aggregate([
			{
				$match: {
					userId: userId,
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

		res.json({ response: responses[0] })
	} catch (error) {
		console.error("Error getting responses by user ID:", error)
		res.status(500).json({ error: "Internal Server Error" })
	}
})

// get a response by response ID
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

		const moderation = await moderate(req.body.text)
		const flagged = moderation.results[0].flagged

		if (flagged) {
			return res.status(403).json({ flagged: true, error: "Response flagged for harmful content" })
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
