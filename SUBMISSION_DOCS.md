# QualiSight AI — Official Submission Documentation

## 1. Problem Statement

Modern manufacturing, assembly lines, logistics hubs, and safety-critical environments still rely heavily on manual visual inspection to detect flaws, cracks, component misalignments, missing safety gear, and document anomalies. Human inspection faces severe limitations:
- **Fatigue & Inconsistency:** Repetitive visual audits cause human inspectors to miss up to 20–30% of subtle anomalies or micro-fractures, especially during extended shifts.
- **Operational Bottlenecks:** Manual verification slows down production throughput and dispatch velocity, creating costly delays.
- **Lack of Quantitative Traceability:** Physical inspections rarely record structured bounding coordinates, confidence metrics, or standardized root-cause logs, making audit compliance difficult.

There is a critical need for an automated, real-time Computer Vision system that ingests camera feeds or images, isolates visual anomalies with bounding regions, computes confidence and severity metrics, and delivers actionable remediation recommendations directly to operators and quality managers.

---

## 2. Solution Description

**QualiSight AI** is an enterprise-grade Computer Vision & Visual Intelligence platform designed to automate quality assurance, defect classification, and operational audit workflows.

### Core Architecture & AI Integration
- **Multimodal Computer Vision Engine:** Powered by Google Gemini 2.5/1.5 Flash Vision API (`@google/genai`), the system performs zero-shot and few-shot anomaly detection, bounding box estimation `[ymin, xmin, ymax, xmax]`, and severity scoring.
- **Fail-Safe Neural Simulation Mode:** Includes an intelligent fallback inspection engine, ensuring zero downtime even under temporary network isolation or rate limits.
- **Real-Time Live Camera Feed Integration:** Operators can connect directly to their webcam or industrial camera via HTML5 MediaDevices with a HUD reticle overlay for instant snapshot audits.
- **Full-Stack Security & Persistence:** Built on Node.js/Express with JSON Web Token (JWT) authentication, bcrypt password hashing, and Zod input validation, persisting audit logs and compliance history to SQLite / PostgreSQL.

### Key Features
1. **Instant Multi-Domain Visual Auditing:** Supports Industrial Quality Control, Hardware & PCB Assembly, Workplace Safety & PPE, and Document/Label Verification.
2. **Interactive Bounding Box Viewport:** Displays visual overlays highlighting defect regions, clickable for deep-dive inspection notes.
3. **Telemetry & Severity Categorization:** Auto-classifies items as **PASS (Nominal)**, **WARNING (Tolerance Deviation)**, or **FAIL (Critical Anomaly)** with numerical quality scoring.
4. **Actionable Remediation Guidance:** Generates procedural operational instructions (e.g. line halt, rework routing, calibration steps).
5. **Historical Audit Ledger & Export:** Full search, status filtering, JSON export, and printable audit certificates for regulatory compliance.
