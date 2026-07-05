const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

// 1. PROSES REGISTER
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Enkripsi password menggunakan bcryptjs
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const { data, error } = await supabase
            .from('users')
            .insert([
                { 
                    name: name, 
                    email: email, 
                    password: hashedPassword // <--- Sudah diganti ke hashedPassword agar aman di cloud!
                }
            ])
            .select();

        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        return res.status(201).json({
            success: true,
            message: "User berhasil didaftarkan ke Supabase!",
            user: data[0]
        });

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// 2. PROSES LOGIN
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Ambil data user dulu dari database berdasarkan email
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single(); 

        if (error || !user) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan atau email salah!" });
        }

        // SEKARANG AMAN: isMatch baru dijalankan SETELAH data user berhasil diambil
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Password salah!" });
        }

        return res.status(200).json({
            success: true,
            message: "Login berhasil!",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};