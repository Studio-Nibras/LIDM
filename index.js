require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const supabase = require("./src/config/supabase");

// import rute
const authRoutes = require("./src/routes/authRoutes");
const lectureRoutes = require("./src/routes/lectureRoutes");
const historyRoutes = require("./src/routes/historyRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const quizRoutes = require("./src/routes/quizRoutes");
const gestureRoutes = require("./src/routes/gestureRoutes");
const workspaceRoutes = require("./src/routes/workspaceRoutes");

// middleware global
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// rute API
app.use("/api/auth", authRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/workspace/gesture", gestureRoutes);
app.use("/api/workspace", workspaceRoutes);

// route testing
app.get("/", (req, res) => {
  res.send("Backend NoteFlow Server Aktif!");
});

// server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
