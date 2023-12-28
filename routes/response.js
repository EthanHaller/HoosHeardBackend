var express = require("express")
var router = express.Router()

const { User, Response } = require("../db")


// get all responses
router.get("/all", async (req, res) => {

})


// create a new response
router.post("/create", async (req, res) => {
	try {
		const user = await User.findOne({
			email: req.body.email,
		})
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

})

// unlike a response
router.post("/unlike", async (req, res) => {
	
})

module.exports = router
