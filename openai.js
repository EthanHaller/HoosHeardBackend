const OpenAI = require("openai")

async function moderate(text) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY })

    const moderation = await openai.moderations.create({ input: text });

    return moderation
}

module.exports = { moderate }