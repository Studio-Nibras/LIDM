const fs = require("fs");
const { transcribeAudio } = require("../services/sttService");

exports.transcribe = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Audio tidak ditemukan",
      });
    }

    const transcript = await transcribeAudio(req.file.path, req.file.mimetype);

    fs.unlinkSync(req.file.path);

    return res.json({
      success: true,
      transcript,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
