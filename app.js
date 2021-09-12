const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const routes = require("./Routes/router");

const app = express();

app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser())
app.use("/", routes);

app.listen(3000, () => console.log("Server started on http://localhost:3000"));