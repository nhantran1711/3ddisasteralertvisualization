const express = require("express");
const cors = require("cors");
const connectDB = require("../db");
const EonetEvent = require("./models/EonetEvents");
require('dotenv').config();
connectDB();

const app = express();
const PORT = 4000;


const corsOptions = {
    origin: ["http://localhost:5173"]
}
app.use(cors(corsOptions));
app.use(express.json());

// Fetch API data from NASA EONET
const fetchAPIEONET = async () => {
    const res = await fetch("https://eonet.gsfc.nasa.gov/api/v3/events");
    const eonetdata = await res.json();

    if (!res.ok) {
        console.error("Fetch data fail", res.status);
        throw new Error("Fail to reach EONET data");
    }

    // Format
    const eonetFormat = eonetdata.events.map((event) => {
        const id = event.id;
        const title = event.title;
        const categories = event.categories?.[0]?.title || "Unknown";
        const geometry = event.geometry?.[0] || {};
        const magnitude = geometry.magnitudeValue || null;
        const date = geometry.date || null;
        const longitude = geometry.coordinates?.[0] || null;
        const latitude = geometry.coordinates?.[1] || null;
    
        return {
            id,
            title,
            categories,
            magnitude,
            date,
            longitude,
            latitude,
            source: "NASA EONET" 
        }})
    return eonetFormat;
}

// API route to fetch data from EONET
app.get("/api/eonet", async (req, res) => {
    try {
        const eonetData = await fetchAPIEONET();

        for (const event of eonetData) {
            // Upsert: insert if not exists, update if exists
            await EonetEvent.findOneAndUpdate(
              { id: event.id },
              event,
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
          }
        res.json(eonetData);
    }
    catch (error) {
        console.log(`Error fetching data: ${error}`);
        res.status(500).json({message: "Unable to fetch data from EONET"})
    }
})

app.listen(PORT, () =>  {
    console.log(`Server is listening on ${PORT}`);
})