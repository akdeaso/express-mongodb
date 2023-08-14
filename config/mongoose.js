const mongoose = require("mongoose");
require("dotenv").config();
// mongoose.connect(
//   "mongodb://root:root@127.0.0.1:27017/latihan-mongoose?authSource=admin"
// );
mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => console.log(`Server database terhubung ${db.host}`));
