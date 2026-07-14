const supabase = require("../config/supabase");

exports.getQuizList = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id wajib dikirim",
      });
    }

    // Ambil semua workspace milik user
    const { data: workspaces, error: workspaceError } = await supabase
      .from("Workspace")
      .select("id")
      .eq("User Id", user_id);

    if (workspaceError) throw workspaceError;

    const workspaceIds = workspaces.map((w) => w.id);

    // Kalau user belum punya workspace
    if (workspaceIds.length === 0) {
      return res.status(200).json({
        success: true,
        quizzes: [],
      });
    }

    // Ambil quiz berdasarkan workspace milik user
    const { data, error } = await supabase
      .from("quisis")
      .select(
        `
        id,
        workspace_id,
        title,
        questions,
        created_at
      `,
      )
      .in("workspace_id", workspaceIds)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const quizzes = data.map((quiz) => ({
      id: quiz.id,
      workspace_id: quiz.workspace_id,
      title: quiz.title || "Untitled Quiz",
      created_at: quiz.created_at,
      question_count: Array.isArray(quiz.questions) ? quiz.questions.length : 0,
    }));

    res.status(200).json({
      success: true,
      quizzes,
    });
  } catch (err) {
    console.error("GET QUIZ LIST ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar quiz",
    });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q = "" } = req.query;

    const currentUserId = req.user.id;

    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
      id,
      username,
      full_name,
      avatar_url
  `,
      )
      .ilike("full_name", `%${q}%`)
      .neq("id", currentUserId)
      .order("full_name");

    if (error) throw error;

    res.status(200).json({
      success: true,
      users: data,
    });
  } catch (err) {
    console.error("SEARCH USER ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Gagal mencari user",
    });
  }
};

exports.createBattle = async (req, res) => {
  try {
    const hostId = req.user.id;
    const { guestId, quizId } = req.body;

    const { data, error } = await supabase
      .from("battle_sessions")
      .insert([
        {
          host_id: hostId,
          guest_id: guestId,
          quiz_id: quizId,
          status: "waiting",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      session: data,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getPendingBattles = async (req, res) => {
  try {
    const guestId = req.user.id;

    const { data, error } = await supabase
      .from("battle_sessions")
      .select(
        `
        *,
        quisis (
          id,
          title
        ),
        host:profiles!battle_sessions_host_id_fkey (
          id,
          full_name,
          username
        )
      `,
      )
      .eq("guest_id", guestId)
      .eq("status", "waiting")
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    res.status(200).json({
      success: true,
      battles: data,
    });
  } catch (err) {
    console.error("GET PENDING BATTLES ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil undangan battle",
    });
  }
};

exports.acceptBattle = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const guestId = req.user.id;

    // Ambil session
    const { data: session, error: sessionError } = await supabase
      .from("battle_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError) throw sessionError;

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Battle session tidak ditemukan",
      });
    }

    // Pastikan hanya guest yang bisa accept
    // console.log("Guest dari JWT :", req.user.id);
    // console.log("Guest di session:", session.guest_id);
    // if (session.guest_id !== guestId) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Kamu bukan penerima battle ini.",
    //   });
    // }

    console.log({
      id: session.id,
      status: session.status,
      guest: session.guest_id,
      host: session.host_id,
    });

    // Pastikan masih waiting
    if (session.status !== "waiting") {
      return res.status(400).json({
        success: false,
        message: "Battle sudah dimulai atau selesai.",
      });
    }

    // Update status
    const { data, error } = await supabase
      .from("battle_sessions")
      .update({
        status: "playing",
        started_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      session: data,
    });
  } catch (err) {
    console.error("acceptBattleSession:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getBattleSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const { data, error } = await supabase
      .from("battle_sessions")
      .select(
        `
        *,
        quisis:battle_sessions_quiz_id_fkey (
          id,
          title,
          questions
        )
      `,
      )
      .eq("id", sessionId)
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      session: data,
      quiz: data.quisis,
    });
  } catch (err) {
    console.error("GET BATTLE SESSION ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.submitBattle = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { score } = req.body;

    const userId = req.user.id;

    const { data: session, error } = await supabase
      .from("battle_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error) throw error;

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Battle tidak ditemukan",
      });
    }

    let updateData = {};

    if (userId === session.host_id) {
      updateData.host_score = score;
      updateData.host_submitted = true;
    }

    if (userId === session.guest_id) {
      updateData.guest_score = score;
      updateData.guest_submitted = true;
    }

    const hostDone = updateData.host_submitted ?? session.host_submitted;

    const guestDone = updateData.guest_submitted ?? session.guest_submitted;

    const finalHostScore = updateData.host_score ?? session.host_score;

    const finalGuestScore = updateData.guest_score ?? session.guest_score;

    if (hostDone && guestDone) {
      updateData.status = "finished";
      updateData.finished_at = new Date();

      if (finalHostScore > finalGuestScore) {
        updateData.winner_id = session.host_id;
      } else if (finalGuestScore > finalHostScore) {
        updateData.winner_id = session.guest_id;
      } else {
        updateData.winner_id = null;
      }
    }

    const { data, error: updateError } = await supabase
      .from("battle_sessions")
      .update(updateData)
      .eq("id", sessionId)
      .select()
      .single();

    if (updateError) throw updateError;

    return res.status(200).json({
      success: true,
      session: data,
    });
  } catch (err) {
    console.error("=== SUBMIT BATTLE ERROR ===");
    console.error(err);
    console.error(err.message);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
