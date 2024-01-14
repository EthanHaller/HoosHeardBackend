const OpenAI = require("openai")

async function generatePrompt() {
	const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY })

	const completion = await openai.chat.completions.create({
		messages: [
			{
				role: "system",
				content: `I have created a social media called HoosHeard where there is a daily question for users to answer. Each user can only answer the question once and only in text, and they must answer it before being able to view other user's answers. Once they do answer the question though, they can see other user's responses, like other responses, and comment on other responses. After each day, a new question is generated, and user's will no longer be able to view past responses. The questions are meant to allow the users to engage in self-expression. 

    Here are some additional rules for you to follow:
    - If there is a well-recognized US holiday today, please try to create a prompt around the holiday, but still be inclusive!
    - User's can only write up to 300 words, so do not create a prompt that is too long
    - Do not include any hashtags in the prompt
    - Do not share any rules within the prompt (such as the 300 word rule)
    - The prompt should be somewhat concise (no more than 50 words)
    - The prompt should not include any instructions to the user (such as "be concise", "describe", "explain")
    
    
    I will type a JSON object with past responses as inspiration as well as the current date. Please return to me a new prompt surrounded by triple quotes (e.g. """new prompt"""). `,
			},
			{
				role: "user",
				content: `[
                    {
                    "date": "01/13/2024",
                    "prompt": "If you had five other lives to lead, what would you do in each of them?"
                    },
                    {
                    "date": "01/12/2024",
                    "prompt": "If you could spend one day doing anything you want, what would you do?"
                    },
                    {
                    "date": "01/11/2024",
                    "prompt": "What is your biggest regret? Why do you regret it? "
                    },
                    {
                    "date": "01/10/2024",
                    "prompt": "Who is your biggest role model? What have they done that has made you look up to them?"
                    },
                    {
                    "date": "01/09/2024",
                    "prompt": "List and describe three things you could do that would make you a better friend. Are you willing to do them?"
                    },
                    {
                    "date": "01/08/2024",
                    "prompt": "What were you most thankful for last year? "
                    },
                    {
                    "date": "01/07/2024",
                    "prompt": "Are you in the right path? If not, why not?"
                    },
                    ]
                    
                    Today's Date: "01/14/2024"`,
			},
		],
		model: "gpt-3.5-turbo",
	})

    let newPrompt = completion.choices[0].message.content
	const startIdx = newPrompt.indexOf('"""') + 3
	const endIdx = newPrompt.lastIndexOf('"""')
    newPrompt = newPrompt.slice(startIdx, endIdx);
    console.log(newPrompt)
	return newPrompt
}

module.exports = { generatePrompt }
