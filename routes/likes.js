var express = require("express")
var router = express.Router()

const { User, Response, Like } = require("../db")

// get all likes by user
router.get("/", async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email })
		if (!user) {
			return res.status(404).json({ error: "User not found" })
		}

		const likes = await Like.find({ userId: user._id })

		res.json({ likes: likes })
	} catch (error) {
		console.error("Error getting all likes:", error)
		res.status(500).json({ error: "Internal Server Error" })
	}
})

// like a response
router.post("/like", async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email })
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
