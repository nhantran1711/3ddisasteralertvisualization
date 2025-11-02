# Disaster Visualization Globe

A React-based 3D globe visualization that displays natural disaster events using the [EONET API](https://eonet.gsfc.nasa.gov/), powered by [`react-globe.gl`](https://github.com/vasturiano/react-globe.gl). Users can toggle between individual disaster points and a heatmap view.

---

## Features

- 3D Globe visualization with animated rotation
- Real-time heatmap of global disaster events using API
- Point-based visualization by disaster categories
- Toggle between views (Heatmap / Points)
- Storing database for future enhancement

---

## 🛠️ Technologies Used

- ReactJS
- ThreeJS: [react-globe.gl](https://github.com/vasturiano/react-globe.gl)
- HTML/CSS
- EONET (Earth Observatory Natural Event Tracker) API
- BackEnd: NodeJS, ExpressJS
- Databse: MongoDB
- Tools: VSCode, Postman

---
## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/nhantran1711/3ddisasteralertvisualization.git
cd 3ddisasteralertvisualization/client
```
### 2. Install Dependencies

```bash
npm install
```
### 3. Start the app

```bash
npm run dev     # If using Vite
# OR
npm start       # If using CRA
```

## Environment Notes

Compatible with Node.js >= 16

All data is fetched from the public NASA EONET API.


## Acknowledgements

NASA EONET for disaster data

Globe.gl for the stunning globe visualization

## Screenshots

Front (before data fetching):

<img width="1430" alt="Screenshot 2025-05-12 at 11 21 46 pm" src="https://github.com/user-attachments/assets/089dc124-4e58-42d7-b4c7-5a9fa6766230" />


Front (after data fetching)

<img width="1437" alt="Screenshot 2025-05-12 at 11 22 47 pm" src="https://github.com/user-attachments/assets/bedfb6f1-f0de-40e2-a191-6757892cc302" />

Toggle Menu:

<img width="190" alt="Screenshot 2025-05-12 at 11 23 08 pm" src="https://github.com/user-attachments/assets/384cdb67-3220-45bd-b864-489316ad01c2" />

Dark Mode:

<img width="1439" alt="Screenshot 2025-05-12 at 11 23 56 pm" src="https://github.com/user-attachments/assets/7e379d2f-28fd-42d7-9cfd-f64137fe8d3b" />

## 📄 License

This project is open-source and available under the MIT License.


