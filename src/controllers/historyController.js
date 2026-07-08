const supabase = require("../config/supabase");

// ===============================
// GET ALL STUDY HISTORY
// ===============================
exports.getHistory = async (req, res) => {
  try {
    const user_id = req.user.id;

    const { data, error } = await supabase
      .from("study_history")
      .select("*")
      .eq("user_id", user_id)
      .order("completed_at", {
        ascending: false,
      });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Get History Error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===============================
// CREATE STUDY HISTORY
// ===============================
exports.createHistory = async (req, res) => {
  try {
    const user_id = req.user.id;

    const { workspace_id, title, score, total_question, percentage } = req.body;

    const { data, error } = await supabase
      .from("study_history")
      .insert([
        {
          user_id,
          workspace_id,
          title,
          score,
          total_question,
          percentage,
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Create History Error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
