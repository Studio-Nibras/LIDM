const supabase = require("../config/supabase");

exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email } = req.query;

    // Hitung jumlah materi
    const { count: workspaceCount, error: workspaceError } = await supabase
      .from("Workspace")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("User Id", userId);

    if (workspaceError) throw workspaceError;

    // Ambil seluruh score
    const { data: historyData, error: historyError } = await supabase
      .from("study_history")
      .select("percentage")
      .eq("user_id", userId);

    if (historyError) throw historyError;

    const learningPoint =
      historyData?.reduce((total, item) => total + item.percentage, 0) || 0;

    return res.status(200).json({
      success: true,
      data: {
        name,
        email,
        workspaceCount: workspaceCount || 0,
        learningPoint,
      },
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil profile.",
      error: err.message,
    });
  }
};
