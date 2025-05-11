const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
    origin: ["http://localhost:5173"]
}

app.use(cors(corsOptions));

app.get("/api", (req, res) => {
    res.json()
})

app.listen(8080, () =>  {
    console.log("Server is listening on PORT 8080")
})