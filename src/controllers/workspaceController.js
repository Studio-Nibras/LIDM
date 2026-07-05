const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require('../config/supabase');

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
    { gestureId: "gst_04", name: "BANTU" }
];

exports.translateGesture = async (req, res) => {
    try {
        const { detectedPatternId } = req.body;
        if (!detectedPatternId) return res.status(400).json({ message: "Tidak ada pola terdeteksi." });

        const matchedGesture = simpleGestureLibrary.find(g => g.gestureId === detectedPatternId);
        if (!matchedGesture) return res.status(404).json({ message: "Gerakan tidak dikenal." });

        const model = await getAIModel();
        const prompt = `Ubah kata isyarat berikut: "${matchedGesture.name}" menjadi sapaan ramah untuk catatan NoteFlow. Berikan teksnya saja.`;
        const result = await model.generateContent(prompt);

        res.status(200).json({
            message: "Berhasil diterjemahkan oleh Gemini AI",
            translation: { rawWord: matchedGesture.name, textResult: result.response.text().trim() }
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal memproses AI.", error: error.message });
    }
};

exports.generateMindMapFromText = async (req, res) => {
    try {
        const { documentContent, title, materialId } = req.body;
        
        if (!documentContent || !materialId) {
            return res.status(400).json({ message: "Data tidak lengkap!" });
        }

        const model = await getAIModel();
        
        // Instruksi sistem untuk memastikan format JSON yang benar
        const prompt = `Analisis materi ini menjadi JSON Mind Map: Judul: "${title}", Konten: "${documentContent}". Format response harus berupa JSON murni tanpa pembungkus markdown, dengan struktur: {"topic": "...", "subtopics": [{"title": "...", "details": ["..."]}]}`;
        
        const result = await model.generateContent(prompt);
        let text = result.response.text();

        // Pembersihan respon dari markdown (jika ada)
        text = text.replace(/```json\n?/g, "").replace(/```/g, "").trim();

        // Parse JSON dengan aman
        const mindMapJson = JSON.parse(text);

        // Simpan ke Supabase
        const { data, error } = await supabase
            .from('mindmaps')
            .insert([{ material_id: materialId, content: mindMapJson }])
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({ message: "Mind Map sukses!", mindMap: data });

    } catch (error) {
        console.error("Error generating mind map:", error);
        res.status(500).json({ message: "Gagal generate mind map.", error: error.message });
    }
};

exports.generateQuizFromText = async (req, res) => {
    try {
        const { documentContent, materialId, title } = req.body;
        if (!documentContent || !materialId) return res.status(400).json({ message: "Data tidak lengkap!" });

        const model = await getAIModel();
        const prompt = `Buatkan 3 soal kuis pilihan ganda JSON dari: "${documentContent}". Format: [{"id": 1, "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "..."}]. Berikan JSON murni tanpa backticks.`;
        const result = await model.generateContent(prompt);
        const quizQuestions = JSON.parse(result.response.text().trim());

        const { data, error } = await supabase.from('quisis').insert([{ materials: materialId, title: title || "Kuis AI", questions: quizQuestions }]).select().single();
        if (error) throw error;

        res.status(200).json({ message: "Soal kuis sukses!", quiz: data });
    } catch (error) {
        res.status(500).json({ message: "Gagal generate kuis.", error: error.message });
    }
};

exports.updateMindMapManual = async (req, res) => {
    try {
        const { mindMapId, updatedGraphData } = req.body;
        const { data, error } = await supabase.from('mindmaps').update({ content: updatedGraphData }).eq('id', mindMapId).select().single();
        if (error) throw error;
        res.status(200).json({ message: "Mind Map diperbarui!", mindMap: data });
    } catch (error) {
        res.status(500).json({ message: "Gagal update.", error: error.message });
    }
};

exports.submitQuiz = async (req, res) => {
    try {
        const { quizId, answers, userId } = req.body;
        
        // Pastikan mencari di tabel 'quisis'
        const { data: quizData, error: quizError } = await supabase
            .from('quisis')
            .select('questions, materials')
            .eq('id', quizId)
            .single();

        if (quizError || !quizData) {
            return res.status(404).json({ message: "Data kuis tidak ditemukan." });
        }

        // Hitung skor sederhana
        let score = 0;
        quizData.questions.forEach((q, index) => {
            const userAnswer = answers.find(a => a.questionIndex === index);
            if (userAnswer && userAnswer.selectedOption === q.correctAnswer) {
                score += (100 / quizData.questions.length);
            }
        });

        // Simpan ke quiz_results[cite: 2]
        await supabase.from('quiz_results').insert([{ 
            user_id: userId, 
            material_id: quizData.materials, 
            score: Math.round(score) 
        }]);

        res.status(200).json({ message: "Kuis selesai!", score: Math.round(score) });
    } catch (error) {
        res.status(500).json({ message: "Gagal submit kuis.", error: error.message });
    }
};