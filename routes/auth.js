var express = require("express")
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
			res.json({ user: existingUser, hasResponded: hasResponded })
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

module.exports = router
