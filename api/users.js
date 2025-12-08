// api/users.js
const { connectDB, User, seedDefaultUsers } = require("./_db");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end("Method Not Allowed");
  }

  try {
    await seedDefaultUsers();
    await connectDB();

    const { username, password } = req.body || {};
    if (!username || !password) {
      res.statusCode = 400;
      return res.json({ error: "Username and password required" });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      res.statusCode = 409;
      return res.json({ error: "Username already exists" });
    }

    const user = await User.create({ username, password, role: "employee" });
    res.statusCode = 201;
    res.json({ username: user.username });
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    res.json({ error: "Server error" });
  }
};
