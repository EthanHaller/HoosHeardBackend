var express = require("express")
const mongoose = require("mongoose")
var router = express.Router()

const { OAuth2Client } = require("google-auth-library")
const { User, Response } = require("../db")

router.post("/google/login", async (req, res) => {
	try {
		const clientId = req.body.clientId
		const jwtToken = req.body.credential

		const client = new OAuth2Client(clientId)
		const ticket = await client.verifyIdToken({
			idToken: jwtToken,
			audience: clientId,
		})

		const payload = ticket.getPayload()

		const existingUser = await User.findOne({ email: payload.email })
		if (existingUser) {
			const response = await Response.findOne({ userId: existingUser._id })
			const hasResponded = response !== null
			const responseId = response && response._id
			res.json({ user: existingUser, hasResponded: hasResponded, responseId: responseId })
		} else {
			const newUser = new User({ email: payload.email })

			const savedUser = await newUser.save()

			res.json({ user: savedUser, hasResponded: false })
		}
	} catch (error) {
		console.error("Google login error:", error)
		res.status(500).json({ error: "Internal Server Error" })
	}
})

router.get("/getuser/:userId", async (req, res) => {
	try {
		const userId = new mongoose.Types.ObjectId(req.params.userId)

		const existingUser = await User.findOne({ _id: userId })
		if (existingUser) {
			const response = await Response.findOne({ userId: existingUser._id })
			const hasResponded = response !== null
			const responseId = response && response._id
			res.json({ user: existingUser, hasResponded: hasResponded, responseId: responseId })
		} else {
			return res.status(404).json({ error: "User not found" })
		}
	} catch (error) {
		console.error("Error getting user information:", error)
		res.status(500).json({ error: "Internal Server Error" })
	}
})

module.exports = router
