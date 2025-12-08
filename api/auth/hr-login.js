// api/auth/hr-login.js
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end("Method Not Allowed");
  }

  const { password } = req.body || {};
  const secret = process.env.HR_SECRET || "hrsecret123";

  if (!password) {
    res.statusCode = 400;
    return res.json({ error: "Missing password" });
  }
  if (password !== secret) {
    res.statusCode = 401;
    return res.json({ error: "Invalid HR password" });
  }
  return res.json({ ok: true });
};
