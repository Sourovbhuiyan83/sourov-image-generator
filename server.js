const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const HF_TOKEN = "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";
const MODEL = "stabilityai/stable-diffusion-xl-base-1.0";

app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    console.log("Generating image for prompt:", prompt);

    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${MODEL}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("HF Error:", err);
      return res.status(500).json({ error: err });
    }

    const imageBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString("base64");
    const imageUrl = `data:image/jpeg;base64,${base64}`;

    console.log("Image generated successfully!");
    res.json({ image: imageUrl });

  } catch (error) {
    console.error("Server Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
