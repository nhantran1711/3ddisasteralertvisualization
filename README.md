# Disaster Visualization Globe

A full-stack real-time 3D disaster tracking application that visualizes global natural events using NASA’s EONET API. The project is built with React, Node.js, MongoDB, and Three.js via `react-globe.gl`.

The system fetches live disaster data, stores it in a database for persistence, and renders it on an interactive 3D globe with filtering, clustering, and multiple visualization modes.

---

## Live Demo

https://3ddisaster.netlify.app

---

## Features

### 3D Global Visualization
- Interactive 3D Earth using `react-globe.gl`
- Real-time rendering of global disaster events using geographic coordinates
- Smooth camera movement, rotation, and focus mode for selected events

### Event Visualization Modes
- Point mode for individual disaster markers
- Heatmap mode for density-based visualization of global activity
- Dynamic rendering based on disaster categories and filters

### Filtering System
- Filter events by disaster category (wildfires, storms, volcanoes, etc.)
- Real-time UI updates without page reload
- Automatic extraction of unique categories from API data

### Event Interaction
- Clickable event markers on the globe
- Detailed event popup including:
  - Title
  - Category
  - Date
  - Geographic coordinates
  - Magnitude (when available)

### Data Management
- Persistent storage using MongoDB Atlas
- Deduplication using upsert operations
- Structured schema for consistent event storage

### Real-Time Sync Engine
- Scheduled hourly synchronization with NASA EONET API
- Manual sync endpoint for testing and debugging
- Resilient handling of external API failures and rate limits

---

## Tech Stack

### Frontend
- React (Vite)
- JavaScript (ES6+)
- Axios
- `react-globe.gl`
- Three.js

### Backend
- Node.js
- Express.js
- Axios
- Node-Cron

### Database
- MongoDB Atlas
- Mongoose

### External API
- NASA EONET (Earth Observatory Natural Event Tracker)

### Deployment
- Frontend: Netlify
- Backend: Render
- Database: MongoDB Atlas

---

## System Architecture

NASA EONET API → Node.js Backend → MongoDB Atlas → REST API → React Frontend → 3D Globe Visualization

---

## API Endpoints

### GET /api/events
Returns all disaster events stored in the database.

Query Parameters:
- category (optional): filter by disaster type
- limit (optional): number of results returned

---

### GET /api/events/categories
Returns a list of all unique disaster categories.

---

### POST /api/sync
Triggers a manual fetch from NASA EONET and updates the database.

---
