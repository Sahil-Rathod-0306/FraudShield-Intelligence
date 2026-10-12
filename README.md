# 🛡️ FraudShield Intelligence

### AI-Powered Financial Fraud Detection & Investigation Platform

**Rule-Based Detection | Behavioral Analysis | Machine Learning | AI Investigation | Fraud Case Management**

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

**GitHub:** [FraudShield-Intelligence](https://github.com/Sahil-Rathod-0306/FraudShield-Intelligence)

---

## 📌 Project Overview

FraudShield Intelligence is a full-stack, AI-powered financial fraud detection and investigation platform designed to analyze transaction activity, identify suspicious behavior, generate risk assessments, and manage fraud investigations.

The platform combines rule-based risk scoring, behavioral analysis, and machine-learning predictions to support financial fraud detection.

It provides an investigator dashboard for monitoring transactions, reviewing fraud cases, assigning investigators, tracking investigations, and generating AI-assisted reports using Ollama.

**Status:** Active development. Educational and portfolio project, not a production-validated banking system.

## ✨ Key Features

- **Transaction Analysis:** Process financial transaction details and calculate fraud risk.
- **Rule-Based Detection:** Identify suspicious transactions using predefined fraud rules.
- **Behavioral Detection:** Evaluate abnormal customer transaction patterns.
- **Machine Learning:** Integrate a Python-based prediction service.
- **Risk Fusion:** Combine multiple detection signals into a final risk score.
- **Fraud Case Management:** Create, retrieve, filter, and update fraud cases.
- **Investigator Assignment:** Assign and unassign investigators.
- **AI Investigations:** Generate investigation reports using Ollama.
- **Dashboard Analytics:** Monitor fraud cases, trends, distributions, and transactions.
- **Fraud Evidence:** Associate evidence and explanations with suspicious transactions.

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB, Mongoose |
| Machine Learning | Python, scikit-learn, XGBoost |
| ML API | FastAPI |
| AI Investigation | Ollama |
| Analytics | Recharts |
| Development | Git, GitHub, VS Code, Postman |

## 🏗️ System Architecture

```text
                   INVESTIGATOR / USER
                           |
                           v
                  NEXT.JS DASHBOARD
                           |
                           v
                 EXPRESS.JS REST API
                           |
           +---------------+---------------+
           |               |               |
           v               v               v
      RULE ENGINE    BEHAVIOR ENGINE    ML SERVICE
                                           |
                                        FastAPI
                                           |
                                      Trained Model
           |               |               |
           +---------------+---------------+
                           |
                           v
                     RISK FUSION
                           |
                           v
                   RISK ASSESSMENT
                           |
                  +--------+--------+
                  |                 |
                  v                 v
            FRAUD EVIDENCE     FRAUD CASES
                  |                 |
                  +--------+--------+
                           |
                           v
                        MONGODB
                           |
                           v
                 INVESTIGATION SYSTEM
                           |
                           v
                     OLLAMA AI
                           |
                           v
                  INVESTIGATION REPORT
```

## 📂 Project Structure

```text
FraudShield-Intelligence/
├── backend/
│   └── src/
├── frontend/
├── ml-service/
│   ├── data/
│   ├── models/
│   └── train_model_v2.py
├── .gitignore
└── README.md
```

The application contains three principal components: the frontend, backend, and machine-learning service.

## 🚀 Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Sahil-Rathod-0306/FraudShield-Intelligence.git
cd FraudShield-Intelligence
```

### 2. Backend Setup

```bash
cd backend
npm install
npm run
```

Check the available scripts and run the development script if present:

```bash
npm run dev
```

Configure MongoDB, ML service connectivity, and the remaining application settings in the backend environment file.

Example configuration (verify variable names against your backend):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/fraudshield
ML_SERVICE_URL=http://127.0.0.1:8000
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:3b
```

### 3. ML Service Setup

```bash
cd ml-service
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
```

Train the model when necessary:

```bash
python train_model_v2.py
```

If the FastAPI application is exposed as `app` inside `main.py`, start it using:

```bash
python -m uvicorn main:app --reload --port 8000
```

Adjust the module name if your ML service uses a different entry point.

### 4. Ollama Setup

```bash
ollama pull qwen2.5:3b
ollama serve
```

If Ollama is already running as a service, another server process is unnecessary.

### 5. Frontend Setup

```bash
cd frontend
npm install
npm run
```

If the development script is available:

```bash
npm run dev
```

Default Next.js development URL:

`http://localhost:3000`

Configure the frontend API connection according to your `lib/api` implementation.

## 🔗 API Reference

The following endpoint paths reflect the project routes and frontend API calls discussed during development. Verify router prefixes against the current backend.

### Transactions

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/transactions` | Analyze a transaction |
| GET | `/api/v1/transactions` | Retrieve transactions |
| GET | `/api/v1/transactions/:transactionId` | Retrieve transaction details |

### Fraud Cases

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/cases` | Retrieve fraud cases |
| GET | `/api/v1/cases/:caseId` | Get case details |
| PATCH | `/api/v1/cases/:caseId/status` | Update status |
| PATCH | `/api/v1/cases/:caseId/assign` | Assign investigator |
| PATCH | `/api/v1/cases/:caseId/unassign` | Unassign investigator |

### Dashboard and AI

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/dashboard/overview` | Dashboard analytics |
| POST | `/api/v1/ai/cases/:caseId/investigate` | Generate AI investigation |

Some endpoints may require authentication depending on the current security middleware.

## 🧪 Example Transaction

**POST `/api/v1/transactions`**

```json
{
  "customerId": "CUS-1001",
  "amount": 75000,
  "currency": "INR",
  "merchant": "Unknown Electronics",
  "deviceId": "DEVICE-NEW-01",
  "ipAddress": "49.50.70.10",
  "location": {
    "city": "Delhi",
    "country": "India"
  },
  "transactionType": "TRANSFER",
  "transactionTime": "2026-10-01T21:45:00.000Z"
}
```

The backend analyzes the transaction, records risk information, and returns the analysis result.

## 📊 Fraud Risk and Case Management

**Supported risk levels:**

- LOW
- MEDIUM
- HIGH
- CRITICAL

**Supported case statuses:**

- OPEN
- INVESTIGATING
- ESCALATED
- CONFIRMED_FRAUD
- FALSE_POSITIVE
- CLOSED

Investigator workflows support case review, assignment, and status tracking.

## 🤖 AI-Assisted Investigation

FraudShield integrates a local Ollama language model to produce contextual investigation analysis.

The workflow uses relevant transaction and fraud-case information as context for the AI model.

AI-generated explanations are decision-support material and must be reviewed by a human investigator.

## 📈 Dashboard Analytics

The dashboard includes views for:

- Total and flagged transactions
- Active and critical fraud cases
- Average fraud risk
- Risk distribution
- Transaction status distribution
- Historical trends
- Recent fraud cases
- Recent transactions

## 📁 Machine Learning Dataset

The training script uses the transaction dataset:

`ml-service/data/PS_20174392719_1491204439457_log.csv`

The large dataset is excluded from Git because it exceeds GitHub's standard 100 MB file limit.

Download the dataset separately from an authorized source and place it in the expected directory before training.

The shared training implementation uses transaction `type` and `amount` to predict the `isFraud` label and evaluates multiple classification algorithms.

## 🔐 Security

- Do not commit `.env` files or credentials.
- Protect sensitive customer and financial information.
- Validate all transaction inputs.
- Restrict investigator actions to authorized users.
- Verify JWT authentication and access controls before deployment.
- Do not rely solely on ML predictions or AI reports to make financial decisions.

## 🗺️ Future Improvements

- Complete authentication and role-based authorization hardening
- Automated API and integration testing
- CI/CD pipelines
- Containerized deployment
- Model performance monitoring
- Fraud analytics enhancements
- Improved investigation audit trails

## 👨‍💻 Developer

**Sahil Rathod**

Backend Developer | Information Technology Engineering Student

GitHub: [Sahil-Rathod-0306](https://github.com/Sahil-Rathod-0306)

## 📄 License

Check the repository for a license file. If no license has been added, usage rights have not been expressly granted.

---

**FraudShield Intelligence — Detect Risk. Investigate Intelligently.**

*Developed for educational, portfolio, and research purposes.*
