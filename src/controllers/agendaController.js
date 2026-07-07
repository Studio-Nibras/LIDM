const supabase = require("../config/supabase");

// ==========================
// CREATE AGENDA
// ==========================
exports.createAgenda = async (req, res) => {
  try {
    const { user_id, title, description, start_time, end_time } = req.body;

    const { data, error } = await supabase
      .from("study_agenda")
      .insert([
        {
          user_id,
          title,
          description,
          start_time,
          end_time,
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Create Agenda Error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================
// GET AGENDA
// ==========================
exports.getAgenda = async (req, res) => {
  try {
    const { user_id } = req.query;

    const { data, error } = await supabase
      .from("study_agenda")
      .select("*")
      .eq("user_id", user_id)
      .order("start_time", {
        ascending: true,
      });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Get Agenda Error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
