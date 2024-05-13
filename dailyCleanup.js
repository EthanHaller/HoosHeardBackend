const cron = require("node-cron")
const { connectDB, Prompt, Response, Like, Comment } = require("./db")
const { generatePrompt } = require("./prompt")

// Function to delete all responses
const deleteAllResponses = async () => {
	console.log("Deleting all Responses...")
	try {
		await Response.deleteMany({})
		console.log("All responses deleted successfully.")
	} catch (error) {
		console.error("Error deleting responses:", error)
	}
}

// Function to delete all likes
const deleteAllLikes = async () => {
	console.log("Deleting all Likes...")
	try {
		await Like.deleteMany({})
		console.log("All likes deleted successfully.")
	} catch (error) {
		console.error("Error deleting likes:", error)
	}
}

// Function to delete all comments
const deleteAllComments = async () => {
	console.log("Deleting all Comments...")
	try {
		await Comment.deleteMany({})
		console.log("All comments deleted successfully.")
	} catch (error) {
		console.error("Error deleting comments:", error)
	}
}

const savePrompt = async (newPromptText) => {
	try {
		const newPrompt = new Prompt({ text: newPromptText })
		await newPrompt.save()
		console.log("New prompt saved successfully.")
	} catch (error) {
		console.error("Error saving new prompt to the database:", error)
	}
}

async function cleanup() {
	await connectDB()

	console.log("Initiating daily cleanup at 04:00 at America/New_York timezone")
	await deleteAllResponses()
	await deleteAllLikes()
	await deleteAllComments()
	console.log("Successfully deleted all necessary documents")
	console.log("Generating a new prompt...")
	const newPrompt = generatePrompt()
	console.log("Successfully generated new prompt:")
	console.log(newPrompt)
	await savePrompt(newPrompt)
	console.log("Successfully completed daily cleanup")
}

cleanup()
