const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const { User, Response } = require("../db")
const { moderate } = require("../openai")

const router = express.Router()

router.post("/signup", async (req, res) => {
	try {
		const { username, password } = req.body

		const existingUser = await User.findOne({ username })
		if (existingUser) {
			return res.status(400).json({ error: "User already exists" })
		}

		const moderation = await moderate(username)
		const flagged = moderation.results[0].flagged
		if (flagged) {
			return res.status(403).json({ flagged: true, error: "Username flagged for harmful content" })
		}

		const isValidLength = username.length >= 3 && username.length <= 20
		const hasNoSpaces = !/\s/.test(username)
		if (!isValidLength || !hasNoSpaces) return res.status(403).json({ flagged: true, error: "Invalid username format" })

		const hashedPassword = await bcrypt.hash(password, 10)
		const user = new User({ username, password: hashedPassword })
		await user.save()

		res.status(201).json({ message: "User registered successfully" })
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Registration failed" })
	}
})

router.post("/login", async (req, res) => {
	try {
		const { username, password } = req.body
		const user = await User.findOne({ username })

		if (!user) {
			return res.status(401).json({ error: "Invalid credentials" })
		}

		const isPasswordValid = await bcrypt.compare(password, user.password)
		if (!isPasswordValid) {
			return res.status(401).json({ error: "Invalid credentials" })
		}

		const response = await Response.findOne({ userId: user._id })
		const hasResponded = response !== null
		const responseId = response && response._id
		res.json({ user: {username: user.username, _id: user._id}, hasResponded: hasResponded, responseId: responseId })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Internal server error" })
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
