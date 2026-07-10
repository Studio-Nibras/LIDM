const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function transcribeAudio(filePath, mimeType) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const audio = {
    inlineData: {
      data: fs.readFileSync(filePath).toString("base64"),
      mimeType,
    },
  };

  const result = await model.generateContent([
    {
      text: `
You are an expert speech transcription AI.

Rules:

- Detect the spoken language automatically.
- Keep the original language exactly.
- Do NOT translate.
- Do NOT summarize.
- Do NOT explain.
- Add punctuation naturally.
- Return ONLY the transcript.
`,
    },
    audio,
  ]);

  return result.response.text();
}

module.exports = {
  transcribeAudio,
};
