var express = require("express");
var router = express.Router();

const { Prompt } = require("../db");

router.get("/latest", async (req, res) => {
  try {
    const latestPrompt = await Prompt.findOne({}).sort({ createdAt: -1 });

    if (latestPrompt) {
      res.json({ prompt: latestPrompt });
    } else {
      // case where there are no prompts in the database
      res.json({ prompt: null });
    }
  } catch (error) {
    console.error("Error handling the latest prompt:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
