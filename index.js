require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const supabase = require("./src/config/supabase");

const authenticateUser = require("./src/middleware/authenticateUser");

// import rute
const authRoutes = require("./src/routes/authRoutes");
const lectureRoutes = require("./src/routes/lectureRoutes");
const historyRoutes = require("./src/routes/historyRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const quizRoutes = require("./src/routes/quizRoutes");
const gestureRoutes = require("./src/routes/gestureRoutes");
const workspaceRoutes = require("./src/routes/workspaceRoutes");
const agendaRoutes = require("./src/routes/agendaRoutes");
const sttRoutes = require("./src/routes/sttRoutes");
const battleRoutes = require("./src/routes/battleRoutes");

// middleware global
const allowedOrigins = [
  "http://localhost:5173",
  "https://noteflow-fe.vercel.app",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
app.use("/api/agenda", agendaRoutes);
app.use("/api/stt", sttRoutes);
app.use("/api/battle", authenticateUser, battleRoutes);

// route testing
app.get("/", (req, res) => {
  res.send("Backend NoteFlow Server Aktif!");
});

// server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
