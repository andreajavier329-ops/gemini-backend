import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Gemini Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /generate-image
app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    // Load Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    // Generate image (Gemini returns base64)
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "image/png",
      },
    });

    const imageBase64 =
      result.response.candidates[0].content.parts[0].inlineData.data;

    res.json({
      success: true,
      prompt,
      image: "data:image/png;base64," + imageBase64,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Image generation failed",
      error: err.message,
    });
  }
});

app.listen(3000, () => {
  console.log("Gemini Image API running on port 3000");
});
