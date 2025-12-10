import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    // Correct Gemini image generation format
    const result = await model.generateContent([
      {
        role: "user",
        parts: [
          { text: prompt },
          { 
            inlineData: {
              mimeType: "image/png"
            }
          }
        ]
      }
    ]);

    const base64Image =
      result.response.candidates[0].content.parts[0].inlineData.data;

    res.json({
      success: true,
      prompt,
      image: "data:image/png;base64," + base64Image,
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
