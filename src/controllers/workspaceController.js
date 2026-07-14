const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require("../config/supabase");

// fungsi autentikasi menggunakan Service Account
async function getAIModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Coba gunakan nama model yang paling standar
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

const simpleGestureLibrary = [
  { gestureId: "gst_01", name: "HALO" },
  { gestureId: "gst_02", name: "TERIMA KASIH" },
  { gestureId: "gst_03", name: "SELESAI" },
  { gestureId: "gst_04", name: "BANTU" },
];

const { extractFile } = require("../services/fileExtractorService");

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada file.",
      });
    }

    const plainText = await extractFile(req.file);

    return res.status(200).json({
      success: true,
      plainText,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.translateGesture = async (req, res) => {
  try {
    const { detectedPatternId } = req.body;
    if (!detectedPatternId)
      return res.status(400).json({ message: "Tidak ada pola terdeteksi." });

    const matchedGesture = simpleGestureLibrary.find(
      (g) => g.gestureId === detectedPatternId,
    );
    if (!matchedGesture)
      return res.status(404).json({ message: "Gerakan tidak dikenal." });

    const model = await getAIModel();
    const prompt = `Ubah kata isyarat berikut: "${matchedGesture.name}" menjadi sapaan ramah untuk catatan NoteFlow. Berikan teksnya saja.`;
    const result = await model.generateContent(prompt);

    res.status(200).json({
      message: "Berhasil diterjemahkan oleh Gemini AI",
      translation: {
        rawWord: matchedGesture.name,
        textResult: result.response.text().trim(),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal memproses AI.", error: error.message });
  }
};

exports.getMindMap = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const { data, error } = await supabase
      .from("mindmaps")
      .select("*")
      .eq("material_id", workspaceId)
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      mindMap: data.content,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil mind map",
      error: error.message,
    });
  }
};

exports.generateMindMapFromText = async (req, res) => {
  try {
    const { workspaceId } = req.body;

    if (!workspaceId) {
      return res.status(400).json({
        message: "Workspace ID wajib dikirim.",
      });
    }

    const { data: workspace, error: workspaceError } = await supabase
      .from("Workspace")
      .select("Title, plain_text")
      .eq("id", workspaceId)
      .single();

    if (workspaceError) throw workspaceError;

    if (!workspace.plain_text) {
      return res.status(400).json({
        message: "Workspace belum memiliki isi note.",
      });
    }

    const model = await getAIModel();

    // Instruksi sistem untuk memastikan format JSON yang benar
    const prompt = `
Analisis materi berikut menjadi mind map.

Judul:
${workspace.Title}

Materi:
${workspace.plain_text}

WAJIB mengembalikan JSON VALID.

JANGAN memberikan penjelasan.

JANGAN menggunakan markdown.

JANGAN menambahkan kata-kata sebelum atau sesudah JSON.

Output HARUS bisa langsung dipanggil JSON.parse().

Format:

{
  "topic":"",
  "subtopics":[
      {
        "title":"",
        "details":[]
      }
  ]
}
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // Bersihkan markdown
    text = text
      .replace(/```json\n?/g, "")
      .replace(/```/g, "")
      .trim();

    let mindMapJson;

    try {
      mindMapJson = JSON.parse(text);
    } catch (err) {
      throw new Error("AI menghasilkan JSON yang tidak valid.");
    }

    // Simpan ke Supabase
    const { data, error } = await supabase
      .from("mindmaps")
      .insert([
        {
          material_id: workspaceId,
          content: mindMapJson,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      message: "Mind Map sukses!",
      mindMap: data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal generate mind map",
      error: error.message,
    });
  }
};

exports.generateQuizFromText = async (req, res) => {
  try {
    const { workspaceId } = req.body;
    if (!workspaceId) {
      return res.status(400).json({
        message: "Workspace ID wajib dikirim.",
      });
    }

    const { data: workspace, error: workspaceError } = await supabase
      .from("Workspace")
      .select("Title, plain_text")
      .eq("id", workspaceId)
      .single();

    if (workspaceError) throw workspaceError;

    if (!workspace.plain_text) {
      return res.status(400).json({
        message: "Workspace belum memiliki isi note.",
      });
    }

    const model = await getAIModel();

    const prompt = `
Berdasarkan materi berikut:

${workspace.plain_text}

Buat tepat 10 soal pilihan ganda.

Kembalikan JSON murni TANPA markdown dan TANPA backticks.

Format WAJIB seperti berikut:

[
  {
    "id": 1,
    "question": "Apa yang dimaksud ...?",
    "options": [
      "Pilihan pertama",
      "Pilihan kedua",
      "Pilihan ketiga",
      "Pilihan keempat"
    ],
    "correctAnswer": "B"
  }
]

ATURAN:
- options hanya berisi isi pilihan, jangan tulis "A.", "B.", "C.", atau "D.".
- correctAnswer HARUS salah satu huruf: "A", "B", "C", atau "D".
- Jangan beri penjelasan.
- Keluarkan JSON saja.
`;

    const result = await model.generateContent(prompt);

    let text = result.response.text().trim();

    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

    if (match) {
      text = match[1];
    }

    let quizQuestions;

    try {
      quizQuestions = JSON.parse(text);
    } catch (err) {
      console.error("Raw Gemini Response:");
      throw new Error("AI menghasilkan JSON quiz yang tidak valid.");
    }

    const { data: existingQuiz, error: existingError } = await supabase
      .from("quisis")
      .select("id")
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    if (existingError) throw existingError;

    let data;
    let error;

    if (existingQuiz) {
      ({ data, error } = await supabase
        .from("quisis")
        .update({
          title: workspace.Title,
          questions: quizQuestions,
        })
        .eq("id", existingQuiz.id)
        .select()
        .single());
    } else {
      ({ data, error } = await supabase
        .from("quisis")
        .insert([
          {
            workspace_id: workspaceId,
            title: workspace.Title,
            questions: quizQuestions,
          },
        ])
        .select()
        .single());
    }

    if (error) throw error;
    if (error) throw error;

    res.status(200).json({ message: "Soal kuis sukses!", quiz: data });
  } catch (error) {
    console.error("=== GENERATE QUIZ ERROR ===");
    console.error(error);

    return res.status(500).json({
      message: "Gagal generate kuis.",
      error: error.message,
    });
  }
};

exports.getQuizByWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const { data, error } = await supabase
      .from("quisis")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single();

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) throw error;

    return res.status(200).json({
      message: "Quiz berhasil diambil.",
      quiz: data,
    });
  } catch (err) {
    console.error("GET QUIZ ERROR:", err);

    return res.status(500).json({
      message: "Gagal mengambil quiz.",
      error: err.message,
    });
  }
};

exports.updateMindMapManual = async (req, res) => {
  try {
    const { mindMapId, updatedGraphData } = req.body;
    const { data, error } = await supabase
      .from("mindmaps")
      .update({ content: updatedGraphData })
      .eq("id", mindMapId)
      .select()
      .single();
    if (error) throw error;
    res.status(200).json({ message: "Mind Map diperbarui!", mindMap: data });
  } catch (error) {
    res.status(500).json({ message: "Gagal update.", error: error.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quizId, answers } = req.body;

    const { data: quizData, error: quizError } = await supabase
      .from("quisis")
      .select("questions, materials")
      .eq("id", quizId)
      .single();

    if (quizError || !quizData) {
      return res.status(404).json({
        message: "Data kuis tidak ditemukan.",
      });
    }

    let score = 0;

    quizData.questions.forEach((q, index) => {
      const userAnswer = answers.find((a) => a.questionIndex === index);

      if (userAnswer && userAnswer.selectedOption === q.correctAnswer) {
        score += 100 / quizData.questions.length;
      }
    });

    await supabase.from("quiz_results").insert([
      {
        user_id: userId,
        material_id: quizData.materials,
        score: Math.round(score),
      },
    ]);

    res.status(200).json({
      message: "Kuis selesai!",
      score: Math.round(score),
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal submit kuis.",
      error: error.message,
    });
  }
};
