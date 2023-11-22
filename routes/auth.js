var express = require("express")
var router = express.Router()

const { OAuth2Client } = require("google-auth-library")

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

		res.json({ user: payload })
	} catch (error) {
		console.error("Google login error:", error)
		res.status(500).json({ error: "Internal Server Error" })
	}
})

module.exports = router
