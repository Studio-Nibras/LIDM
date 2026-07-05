// library deteksi isyarat
const simpleGestureLibrary = [
    {
        gestureId: "gst_01",
        name: "HALO",
        rules: "Semua jari terbuka tegak ke atas (melambai)"
    },
    {
        gestureId: "gst_02",
        name: "TERIMA KASIH",
        rules: "Tangan terbuka dari depan mulut bergerak ke arah depan bawah"
    },
    {
        gestureId: "gst_03",
        name: "SELESAI",
        rules: "Ibu jari dan jari telunjuk membentuk huruf O (Oke)"
    },
    {
        gestureId: "gst_04",
        name: "BANTU",
        rules: "Satu tangan mengepal di atas telapak tangan lainnya yang terbuka"
    }
];


// ambil daftar kosakata
exports.getGestureLibrary = (req, res) => {
    try {
        res.status(200).json({
            message: "Berhasil memuat library gerakan isyarat yang didukung",
            totalVocabulary: simpleGestureLibrary.length,
            supportedGestures: simpleGestureLibrary
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal memuat library isyarat." });
    }
};

// terjemahan koordinat isyarat menjadi teks
exports.translateGesture = (req, res) => {
    try {
        const { detectedPatternId, confidenceScore } = req.body;

        if (!detectedPatternId) {
            return res.status(400).json({ message: "Tidak ada pola gerakan tangan yang terdeteksi oleh kamera." });
        }
        
        const matchedGesture = simpleGestureLibrary.find(g => g.gestureId === detectedPatternId);

        if (!matchedGesture) {
            return res.status(404).json({ message: "Gerakan tangan tidak dikenali dalam library." });
        }

        if (confidenceScore && confidenceScore < 0.7) {
            return res.status(422).json({ 
                message: "Gerakan terdeteksi samar, mohon posisikan tangan Anda lebih jelas ke kamera." 
            });
        }

        res.status(200).json({
            message: "Isyarat tangan berhasil diterjemahkan!",
            translation: {
                textResult: matchedGesture.name,
                insertedToWorkspace: true,
                timestamp: new Date().toLocaleTimeString()
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal menerjemahkan gerakan isyarat." });
    }
};