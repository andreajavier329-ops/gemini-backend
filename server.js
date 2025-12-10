import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Gemini backend is running.");
});

// IMAGE GENERATION ROUTE
app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateImage?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: { text: prompt },
        }),
      }
    );

    const data = await response.json();

    if (!data.generatedImages || data.generatedImages.length === 0) {
      return res.status(500).json({
        success: false,
        message: "No image returned",
        error: data,
      });
    }

    const base64 = data.generatedImages[0].image.base64Data;

    res.json({
      success: true,
      image: "data:image/png;base64," + base64,
    });
  } catch (err) {
    console.error("Image error:", err);
    res.status(500).json({
      success: false,
      message: "Image generation failed",
      error: err.message,
    });
  }
});

// SERVER START
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port " + port));
