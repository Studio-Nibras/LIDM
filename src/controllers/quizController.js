const supabase = require('../config/supabase'); 

// menu kuis
exports.getQuizMenu = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('quisis')
            .select('*');

        if (error) throw error;

        res.status(200).json({
            message: "Berhasil memuat daftar menu kuis dari Supabase!",
            quizzes: data || []
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal memuat menu kuis.", error: error.message });
    }
};

// submit kuis mandiri
exports.submitQuizMandiri = async (req, res) => {
    try {
        // ambil data
        const { user_id, material_id, score } = req.body;

        // validasi input
        if (!user_id || !score) {
            return res.status(400).json({ message: "Data tidak lengkap! (user_id dan score wajib ada)" });
        }

        // simpan
        const { data, error } = await supabase
            .from('quiz_results')
            .insert([{ 
                user_id: user_id, 
                material_id: material_id, 
                score: score 
            }]);

        if (error) throw error;

        res.status(201).json({ 
            message: "Hasil kuis mandiri berhasil disimpan!",
            data: data 
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal menyimpan hasil kuis.", error: error.message });
    }
};

// battle
exports.findBattleOpponent = async (req, res) => {
    try { res.status(200).json({ message: "Mencari lawan kuis..." }); } catch (e) { res.status(500).json({ message: "Eror" }); }
};

exports.searchUsersForBattle = async (req, res) => {
    try { res.status(200).json({ message: "Hasil pencarian user..." }); } catch (e) { res.status(500).json({ message: "Eror" }); }
};

exports.getOnlineFriendsList = async (req, res) => {
    try { res.status(200).json({ friendsOnline: [] }); } catch (e) { res.status(500).json({ message: "Eror" }); }
};

exports.sendBattleInvitation = async (req, res) => {
    try { res.status(200).json({ message: "Undangan dikirim!" }); } catch (e) { res.status(500).json({ message: "Eror" }); }
};

exports.updateBattleProgress = async (req, res) => {
    try { res.status(200).json({ status: "Progres diperbarui" }); } catch (e) { res.status(500).json({ message: "Eror" }); }
};

exports.submitBattleResult = async (req, res) => {
    try { res.status(200).json({ status: "Battle selesai" }); } catch (e) { res.status(500).json({ message: "Eror" }); }
};