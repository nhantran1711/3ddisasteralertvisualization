require('dotenv').config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { createProxyMiddleware } = require('http-proxy-middleware');
const connectDB = require("../db");
const mongoose = require('mongoose');
const EonetEvent = require("./models/EonetEvents");

connectDB();

const app = express();
const PORT = 4000;

const corsOptions = {
    origin: ["http://localhost:5173"]
}
app.use(cors(corsOptions));
app.use(express.json());

// Proxy to the EONET API
app.use('/api/eonet', createProxyMiddleware({
    target: 'https://eonet.gsfc.nasa.gov/api/v3/events',
    changeOrigin: true, // Change the origin of the request
    pathRewrite: {
      '^/api/eonet': '', // Remove the `/api/eonet` prefix
    },
  }));

// Fetch API data from NASA EONET using axios
const fetchAPIEONET = async () => {
    try {
        const res = await axios.get("https://eonet.gsfc.nasa.gov/api/v3/events");

        // Log the fetched data to see its structure
        console.log("Fetched data from EONET:", res.data);
        const eonetFormat = res.data.events.map((event) => {
            const id = event.id;
            const title = event.title;
            const categories = event.categories?.[0]?.title || "Unknown";
          
            // Ensure geometry is defined and safely access its properties
            const geometry = event.geometry?.[0] || {};  // If geometry array is empty or undefined, use an empty object as fallback
          
            // Safely extract values from geometry
            const magnitude = geometry.magnitudeValue || 'N/A';  // Default to 'N/A' if magnitude is undefined
            const date = geometry.date || 'N/A';  // Default to 'N/A' if date is undefined
          
            // Extract coordinates if present, with fallback to 'N/A'
            const longitude = geometry.coordinates?.[0] || 'N/A';
            const latitude = geometry.coordinates?.[1] || 'N/A';
          
            return {
              id,
              title,
              categories,
              magnitude,
              date,
              longitude,
              latitude,
            };
          });

        // Log formatted data
        console.log("Formatted data:", eonetFormat);

        return eonetFormat;
    } catch (error) {
        console.error("Error fetching data from EONET:", error);
        throw new Error("Failed to reach EONET API");
    }
};

// API route to fetch data from EONET and insert/update into MongoDB
app.get("/api/eonet", async (req, res) => {
    try {
        const eonetData = await fetchAPIEONET();

        const batchSize = 100; // Set a batch size for bulkWrite
        let totalUpserted = 0; // To track the total upserted events

        for (let i = 0; i < eonetData.length; i += batchSize) {
            const batch = eonetData.slice(i, i + batchSize);
            const operations = batch.map((event) => ({
                updateOne: {
                    filter: { id: event.id },
                    update: { $set: event },
                    upsert: true
                }
            }));

            // Perform bulk upsert operation for this batch
            const result = await EonetEvent.bulkWrite(operations);
            totalUpserted += result.nUpserted;
        }

        res.json({ message: `Successfully upserted ${totalUpserted} events` });
    } catch (error) {
        console.log(`Error fetching data: ${error}`);
        res.status(500).json({ message: "Unable to fetch data from EONET" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
});
