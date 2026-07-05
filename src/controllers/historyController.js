const supabase = require('../config/supabase');

// ambil riwayat belajar
exports.getHistoryDashboard = async (req, res) => {
    try {
        const { data: learningHistory, error: historyError } = await supabase
            .from('materials')
            .select('*')
            .order('created_at', { ascending: false }); // Urutkan dari yang paling baru diunggah

        if (historyError) throw historyError;

        res.status(200).json({
            message: "Berhasil memuat dashboard riwayat belajar dari Supabase",
            summary: {
                totalCompleted: learningHistory ? learningHistory.length : 0,
                lastOpened: "Terakhir dibuka baru saja"
            },
            // mapping data
            historyLogs: learningHistory ? learningHistory.map(item => ({
                id: item.id,
                workspaceId: item.workspace_id,
                fileName: item.file_name || "Berkas Tanpa Nama",
                fileUrl: item.file_url,
                uploadedAt: item.created_at
            })) : []
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal memproses data riwayat belajar.", error: error.message });
    }
};

// mock response agenda
exports.createAgenda = async (req, res) => {
    try {
        const { title } = req.body;
        res.status(201).json({
            message: "Jadwal berhasil ditambahkan (Simulasi data lokal)",
            agenda: { title: title || "Agenda Baru", created_at: new Date() }
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal.", error: error.message });
    }
};

// aktivitas kalender
exports.logActivity = async (req, res) => {
    try {
        const { user_id, action } = req.body;
        
        const { data, error } = await supabase
            .from('kalender') // Sekarang menargetkan tabel kalender
            .insert([{ user_id, action }]);

        if (error) throw error;

        res.status(201).json({ message: "Aktivitas berhasil dicatat di kalender!" });
    } catch (error) {
        res.status(500).json({ message: "Gagal mencatat aktivitas.", error: error.message });
    }
};