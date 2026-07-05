const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

// data profile
exports.getUserProfile = async (req, res) => {
    try {
        const { userId } = req.query;

        const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId || 101)
            .single();

        if (error || !profile) {
            return res.status(404).json({ message: "Gagal memuat atau data profil tidak ditemukan." });
        }

        res.status(200).json({
            message: "Berhasil memuat profil pengguna dari Supabase",
            profile
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal memuat data profil.", error: error.message });
    }
};

// ubah nama/email
exports.updateAccountSettings = async (req, res) => {
    try {
        const { userId, name, email } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;

        const { data: updatedProfile, error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId || 101)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({
            message: "Pengaturan akun berhasil diperbarui di cloud!",
            updatedProfile
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal memperbarui pengaturan akun.", error: error.message });
    }
};

// update pw ato email
exports.updateSecuritySettings = async (req, res) => {
    try {
        const { userId, actionType, oldPassword, newPassword, newEmail, toggle2FA } = req.body;
        const currentUserId = userId || 101;

        // ambil data
        const { data: security, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUserId)
            .single();

        if (fetchError || !security) {
            return res.status(404).json({ message: "Data user tidak ditemukan." });
        }

        if (actionType === "change-password") {
           const isMatch = await bcrypt.compare(oldPassword, security.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Password lama yang Anda masukkan salah!" });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const { error: updateError } = await supabase
                .from('users')
                .update({ password: hashedPassword })
                .eq('id', currentUserId);

            if (updateError) throw updateError;
            return res.status(200).json({ message: "Password akun berhasil diperbarui secara aman di Supabase!" });
        }

        if (actionType === "change-email") {
            const isMatch = await bcrypt.compare(oldPassword, security.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Password salah, tidak dapat mengubah email!" });
            }

            const { error: emailError } = await supabase
                .from('users')
                .update({ email: newEmail })
                .eq('id', currentUserId);

            if (emailError) throw emailError;
            return res.status(200).json({ message: "Email berhasil diubah di database utama!" });
        }

        if (actionType === "toggle-2fa") {
            const { error: faError } = await supabase
                .from('users')
                .update({ two_factor_enabled: toggle2FA })
                .eq('id', currentUserId);

            if (faError) throw faError;
            return res.status(200).json({ message: "Status keamanan 2FA berhasil di-update." });
        }

        res.status(400).json({ message: "Tipe aksi keamanan tidak dikenali." });
    } catch (error) {
        res.status(500).json({ message: "Gagal memproses pengaturan keamanan akun.", error: error.message });
    }
};

// faq
exports.getHelpCenterFAQs = (req, res) => {
    try {
        const faqs = [
            { id: 1, question: "Bagaimana cara kerja AI NoteFlow?", answer: "AI menganalisis transkrip teks dan menyusunnya dalam bentuk visual otomatis." },
            { id: 2, question: "Apakah poin belajar bisa berkurang?", answer: "Tidak, poin dihitung secara kumulatif." }
        ];
        res.status(200).json({ message: "Berhasil memuat data Pusat Bantuan", faqs });
    } catch (error) {
        res.status(500).json({ message: "Gagal memuat data Pusat Bantuan." });
    }
};