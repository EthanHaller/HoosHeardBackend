var express = require("express")
const mongoose = require("mongoose")
var router = express.Router()

const { User, Response } = require("../db")

// get all responses
router.get("/", async (req, res) => {
	try {
		const responses = await Response.aggregate([
			{
				$lookup: {
					// from the likes collection get all documents with matching responseId
					from: "likes",
					localField: "_id",
					foreignField: "responseId",
					as: "likes",
				},
			},
			{
				$lookup: {
					// from the comments collection get all documents with matching responseId
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

// get a response by ID
router.get("/:id", async (req, res) => {
	try {
		const responseId = req.params.id

		const response = await Response.aggregate([
			{
				$match: {
					_id: new mongoose.Types.ObjectId(responseId),
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
