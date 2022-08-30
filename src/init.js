//Environment Variable File
import "dotenv/config";

//DataBase
import "./db";

//Video Model
import "./models/Video";
import "./models/User";

//Server
import app from "./server";
const PORT = 7777;

const handleListening = () =>
  console.log(`Server Listening On Port http://localhost:${PORT}`);

app.listen(PORT, handleListening);
