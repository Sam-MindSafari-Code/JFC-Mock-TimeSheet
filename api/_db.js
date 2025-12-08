// api/_db.js
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "betatestdata";

if (!MONGO_URI) {
  throw new Error("Please set MONGO_URI in environment variables");
}

let cached = global._mongooseCached;
if (!cached) {
  cached = global._mongooseCached = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, { dbName: DB_NAME })
      .then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Schemas / Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // plain text for demo ONLY
  role: { type: String, enum: ["employee"], default: "employee" }
});

const timesheetSchema = new mongoose.Schema({
  username: { type: String, required: true },
  date: { type: String, required: true }, // yyyy-mm-dd
  duration: { type: Number, required: true },
  unit: { type: String, default: "Hours" },
  attendance: { type: String, enum: ["Attended", "Not attended"], required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ["Submitted", "Approved", "Unapproved"],
    default: "Submitted"
  }
});

const User =
  mongoose.models.User || mongoose.model("User", userSchema);
const Timesheet =
  mongoose.models.Timesheet || mongoose.model("Timesheet", timesheetSchema);

// seed default employee accounts (Tianna, Lincoln)
async function seedDefaultUsers() {
  await connectDB();
  const defaults = [
    { username: "tianna", password: "12345", role: "employee" },
    { username: "lincoln", password: "12345", role: "employee" }
  ];
  for (const u of defaults) {
    await User.updateOne(
      { username: u.username },
      { $setOnInsert: u },
      { upsert: true }
    );
  }
}

module.exports = { connectDB, User, Timesheet, seedDefaultUsers };
