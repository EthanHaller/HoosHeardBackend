const mongoose = require("mongoose")
require("dotenv/config")

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI)
		console.log("Connected to MongoDB")
	} catch (error) {
		console.error("Error connecting to MongoDB:", error)
	}
}

const Schema = mongoose.Schema

const UserSchema = new Schema({
	email: String,
})

const PromptSchema = new Schema({
	text: String,
	createdAt: { type: Date, default: Date.now() },
})

const ResponseSchema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: "User" },
	promptId: { type: Schema.Types.ObjectId, ref: "Prompt" },
	text: String,
	createdAt: { type: Date, default: Date.now() },
})

const LikeSchema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: "User" },
	responseId: { type: Schema.Types.ObjectId, ref: "Response" },
	createdAt: { type: Date, default: Date.now() },
})

const CommentSchema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: "User" },
	responseId: { type: Schema.Types.ObjectId, ref: "Response" },
	text: String,
	createdAt: { type: Date, default: Date.now() },
})

const User = mongoose.model("User", UserSchema)
const Prompt = mongoose.model("Prompt", PromptSchema)
const Response = mongoose.model("Response", ResponseSchema)
const Like = mongoose.model("Like", LikeSchema)
const Comment = mongoose.model("Comment", CommentSchema)

module.exports = { connectDB, User, Prompt, Response, Like, Comment }