import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL, {
  usenewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
const dbOpen = () => console.log("DB Connected Success!");
const dbError = (error) => console.log("DB Error", error);
db.on("error", dbError);
db.once("open", dbOpen);
