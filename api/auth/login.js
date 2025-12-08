// api/auth/login.js
const { connectDB, User, seedDefaultUsers } = require("../_db");

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
      return res.json({ error: "Missing username or password" });
    }

    const user = await User.findOne({ username, role: "employee" });
    if (!user || user.password !== password) {
      res.statusCode = 401;
      return res.json({ error: "Invalid credentials" });
    }

    return res.json({ username: user.username, role: user.role });
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    res.json({ error: "Server error" });
  }
};
