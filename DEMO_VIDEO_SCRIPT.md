# QualiSight AI — Demo Video Presentation Script (3–5 Minutes)

Use this script and guide to record your 3–5 minute hackathon demo video (using OBS Studio, Loom, or Screen Studio).

---

## ⏱️ Video Timeline Breakdown

| Timestamp | Section | Key Focus |
| :--- | :--- | :--- |
| **0:00 – 0:45** | **The Hook & Problem Statement** | Explain manual inspection bottlenecks & risks |
| **0:45 – 1:30** | **Platform Overview & Quick Login** | Dashboard KPIs & architecture introduction |
| **1:30 – 3:00** | **Live AI Inspection Walkthrough** | Upload/Camera scan, bounding box detection, recommendations |
| **3:00 – 3:45** | **Audit History & Compliance Export** | Historical ledger, JSON export, and print preview |
| **3:45 – 4:30** | **Technical Stack & Wrap-Up** | React, Vite, Node, Express, Zod, JWT, Gemini Vision API |

---

## 🎙️ Spoken Word Script & Screen Actions

### 1. Introduction & The Problem (0:00 – 0:45)
- **Screen:** Show title slide or GitHub repo / landing screen.
- **Presenter (Voiceover):**
  > *"Hello judges! Welcome to our hackathon presentation. In modern manufacturing, warehousing, and quality-critical industries, organizations still rely on manual human inspection of components, camera feeds, and scanned documents.*
  > 
  > *This results in slow decision-making, missed micro-fractures, human fatigue, and inconsistent compliance logs.*
  > 
  > *To solve this challenge, we built **QualiSight AI** — an end-to-end Computer Vision and Visual Intelligence platform that automates anomaly isolation, computes confidence and severity metrics, and delivers immediate, actionable remediation insights."*

---

### 2. Login & Dashboard Command Center (0:45 – 1:30)
- **Screen:** Show the Login page (`/login`), click the **"1-Click Instant Demo Access"** button, then show the Dashboard (`/dashboard`).
- **Presenter (Voiceover):**
  > *"Here is our login interface, protected by JWT authentication and bcrypt password hashing. For evaluation convenience, we've provided a one-click instant demo access button.*
  > 
  > *Upon entering, operators are greeted with the **Visual Intelligence Command Dashboard**. It provides real-time telemetry: Total Scans, Nominal Pass Rates, Warning Flags, and Critical Anomalies, along with a live feed of recent inspections."*

---

### 3. Live AI Inspection Demonstration (1:30 – 3:00)
- **Screen:** Navigate to **New Inspection** (`/inspect/new`). Click **"Load Defect Specimen (Fracture)"** or toggle the **Live Camera / Webcam**. Click **"Execute AI Visual Inspection"**. Show the scanning animation and the resulting **Inspection Viewer**.
- **Presenter (Voiceover):**
  > *"Now let's launch a live visual inspection. Operators can either upload images directly, choose from quick specimen presets, or turn on the integrated live camera viewfinder with reticle alignment.*
  > 
  > *Let's run an audit on a test specimen. When we click 'Execute AI Visual Inspection', our backend sends the frame to our Computer Vision pipeline powered by Google Gemini 2.5 Flash.*
  > 
  > *Notice the result: The system immediately flags this as **CRITICAL DEFECT DETECTED** with 94% confidence. Right on the visual viewport, it renders normalized 2D bounding boxes isolating the surface fracture and thermal stress marks.*
  > 
  > *On the right panel, it breaks down the exact anomaly dimensions, risk levels, and most importantly, generates **Actionable Recommendations** — such as halting assembly segment 4 and routing the lot for verification."*

---

### 4. Audit History & Compliance Reports (3:00 – 3:45)
- **Screen:** Navigate to **Audit History** (`/history`). Demonstrate filtering by status (`FAIL` / `PASS`), searching by keyword, and click **"Export JSON"** and **"Print Audit Report"**.
- **Presenter (Voiceover):**
  > *"Every single inspection is securely archived into our database. The **Audit History** allows managers to filter by category or pass/fail verdict and search by defect keywords.*
  > 
  > *With one click, quality engineers can export the structured JSON telemetry or generate a printable formal audit report for ISO compliance."*

---

### 5. Tech Stack & Conclusion (3:45 – 4:30)
- **Screen:** Briefly show the code structure in VS Code / GitHub repo and the live deployed link.
- **Presenter (Voiceover):**
  > *"Under the hood, QualiSight AI is built using:
  > - **Frontend:** React with Vite, Tailwind CSS, Lucide Icons, and Axios.
  > - **Backend:** Node.js, Express, JWT, bcrypt password hashing, and Zod input validation.
  > - **Vision AI:** Google Gemini Vision API with structured JSON output schema and an intelligent fail-safe simulation engine.
  > - **Database:** Fast relational SQLite / PostgreSQL storage.
  > 
  > *QualiSight AI transforms slow manual checks into automated, high-precision visual intelligence. Thank you!"*
