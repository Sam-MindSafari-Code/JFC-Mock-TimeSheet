// api/timesheets.js
const { connectDB, Timesheet, seedDefaultUsers } = require("./_db");

module.exports = async (req, res) => {
  try {
    await seedDefaultUsers();
    await connectDB();

    if (req.method === "GET") {
      const { username } = req.query || {};
      if (!username) {
        res.statusCode = 400;
        return res.json({ error: "username query required" });
      }
      const list = await Timesheet.find({ username }).sort({ date: -1, _id: -1 });
      return res.json(list);
    }

    if (req.method === "POST") {
      const { username, date, duration, attendance, description } = req.body || {};
      if (!username || !date || duration == null || !attendance) {
        res.statusCode = 400;
        return res.json({ error: "Missing fields" });
      }
      const ts = await Timesheet.create({
        username,
        date,
        duration,
        unit: "Hours",
        attendance,
        description: description || "",
        status: "Submitted"
      });
      res.statusCode = 201;
      return res.json(ts);
    }

    if (req.method === "PUT") {
      const { id, username, date, duration, attendance, description } = req.body || {};
      if (!id || !username) {
        res.statusCode = 400;
        return res.json({ error: "id and username required" });
      }
      const ts = await Timesheet.findById(id);
      if (!ts) {
        res.statusCode = 404;
        return res.json({ error: "Timesheet not found" });
      }
      if (ts.username !== username) {
        res.statusCode = 403;
        return res.json({ error: "Cannot edit other users' timesheets" });
      }
      if (ts.status !== "Unapproved") {
        res.statusCode = 400;
        return res.json({ error: "Only unapproved timesheets can be edited" });
      }

      ts.date = date || ts.date;
      ts.duration = duration != null ? duration : ts.duration;
      ts.attendance = attendance || ts.attendance;
      ts.description = description != null ? description : ts.description;
      ts.status = "Submitted"; // resubmitted
      await ts.save();
      return res.json(ts);
    }

    res.statusCode = 405;
    res.end("Method Not Allowed");
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    res.json({ error: "Server error" });
  }
};
