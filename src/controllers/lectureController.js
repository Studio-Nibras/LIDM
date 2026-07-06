const supabase = require("../config/supabase");

// bikin note
exports.createNote = async (req, res) => {
  try {
    // ambil title dan userId dari request body
    const { title, plainText, userId } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Judul materi harus diisi!" });
    }

    // insert supabase
    const { data, error } = await supabase
      .from("Workspace")
      .insert([
        {
          Title: title,
          plain_text: plainText,
          "User Id": userId || "00000000-0000-0000-0000-000000000000",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "Materi (Note) berhasil dibuat!",
      data: data,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal membuat materi.", error: error.message });
  }
};

// simpan transkrip
exports.saveTranscript = async (req, res) => {
  try {
    const { title } = req.body;
    const file = req.file;

    if (!title) {
      return res.status(400).json({ message: "Judul materi harus diisi!" });
    }

    const { data: newLecture, error } = await supabase
      .from("Workspace")
      .insert([
        {
          Title: title,
          "User Id": "00000000-0000-0000-0000-000000000000",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: file ? "File berhasil diunggah!" : "Teks berhasil disimpan!",
      data: newLecture,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal memproses data.", error: error.message });
  }
};

// ambil materi
exports.getAllLectures = async (req, res) => {
  try {
    const { data, error } = await supabase.from("Workspace").select("*");
    if (error) throw error;
    res.status(200).json({ message: "Berhasil mengambil semua materi", data });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data materi.", error: error.message });
  }
};

// generate mind map
exports.generateMindMap = async (req, res) => {
  try {
    const { lectureId } = req.body;

    if (!lectureId) {
      return res
        .status(400)
        .json({ message: "lectureId (ID Workspace) harus diisi!" });
    }

    const { data, error } = await supabase
      .from("mindmaps")
      .insert([
        {
          material_id: lectureId,
          content: { title: "Mind Map Arsitektur", nodes: [] },
        },
      ])
      .select()
      .single();

    if (error) throw error;
    res
      .status(200)
      .json({ message: "AI berhasil membuat Mind Map!", mindMap: data });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal generate mind map.", error: error.message });
  }
};

// update mind map
exports.updateMindMap = async (req, res) => {
  try {
    const { mindMapId } = req.params;
    const { nodes } = req.body;

    const { data, error } = await supabase
      .from("mindmaps")
      .update({
        content: { title: "Mind Map Arsitektur", nodes: nodes || [] },
      })
      .eq("id", mindMapId)
      .select()
      .single();

    if (error) throw error;
    res
      .status(200)
      .json({ message: "Mind Map berhasil diperbarui!", mindMap: data });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal memperbarui Mind Map.", error: error.message });
  }
};

// download mind map dan proses audio
exports.downloadMindMap = async (req, res) => {
  try {
    res.status(200).json({ message: "File siap diunduh" });
  } catch (e) {
    res.status(500).json({ message: "Gagal." });
  }
};
exports.processMicAudio = async (req, res) => {
  try {
    res.status(201).json({ message: "Audio mikrofon berhasil direkam!" });
  } catch (e) {
    res.status(500).json({ message: "Eror." });
  }
};

// generate kuis
exports.generateQuiz = async (req, res) => {
  try {
    const { lectureId } = req.body;

    if (!lectureId) {
      return res
        .status(400)
        .json({ message: "lectureId (ID Workspace) harus diisi!" });
    }

    // otomatis generate mind map
    const { data: mindMapData, error: mindMapError } = await supabase
      .from("mindmaps")
      .insert([
        {
          material_id: lectureId,
          content: { title: "Mind Map Otomatis", nodes: [] },
        },
      ])
      .select()
      .single();

    if (mindMapError) throw mindMapError;

    // otomatis generate kuis
    const { data: quizData, error: quizError } = await supabase
      .from("quisis")
      .insert([
        {
          materials: lectureId,
          title: "Kuis: AI Generated",
          questions: [],
        },
      ])
      .select()
      .single();

    if (quizError) throw quizError;

    // Kirim respon sukses double combo!
    res.status(201).json({
      message: "AI sukses membuat Mind Map dan Kuis sekaligus!",
      mindMap: mindMapData,
      quiz: quizData,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal memproses fitur AI.", error: error.message });
  }
};

// submit
exports.submitQuizAnswers = async (req, res) => {
  try {
    const { quizId, materialId } = req.body;

    if (!quizId) {
      return res.status(400).json({ message: "quizId harus diisi!" });
    }

    const { data: quiz, error: quizError } = await supabase
      .from("quisis")
      .select("*")
      .eq("id", quizId)
      .single();

    if (quizError || !quiz) {
      return res.status(404).json({ message: "Data kuis tidak ditemukan." });
    }

    const finalScore = 100;

    const { data: resultData, error: resultError } = await supabase
      .from("quiz_results")
      .insert([
        {
          user_id: "00000000-0000-0000-0000-000000000000",
          material_id: materialId || quiz.materials,
          score: finalScore,
        },
      ])
      .select()
      .single();

    if (resultError) throw resultError;

    res.status(200).json({
      message: "Kuis Berhasil Diselesaikan dan Nilai Tersimpan!",
      quizResultSummary: {
        quizId: quiz.id,
        quizTitle: quiz.title || "Kuis AI",
        scorePercent: finalScore,
        savedResult: resultData,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal memproses jawaban kuis.", error: error.message });
  }
};
