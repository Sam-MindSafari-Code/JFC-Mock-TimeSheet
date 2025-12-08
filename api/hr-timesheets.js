// api/hr-timesheets.js
const { connectDB, Timesheet } = require("./_db");

module.exports = async (req, res) => {
  try {
    await connectDB();

    if (req.method === "GET") {
      const list = await Timesheet.find({}).sort({ date: -1, _id: -1 });
      return res.json(list);
    }

    if (req.method === "PUT") {
      const { updates } = req.body || {};
      if (!Array.isArray(updates)) {
        res.statusCode = 400;
        return res.json({ error: "updates array required" });
      }

      for (const u of updates) {
        const { id, status } = u;
        if (!id || !["Submitted", "Approved", "Unapproved"].includes(status)) continue;
        const ts = await Timesheet.findById(id);
        if (!ts) continue;
        ts.status = status;
        await ts.save();
      }

      const list = await Timesheet.find({}).sort({ date: -1, _id: -1 });
      return res.json(list);
    }

    res.statusCode = 405;
    res.end("Method Not Allowed");
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    res.json({ error: "Server error" });
  }
};
