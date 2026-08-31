# ResolveAI – AI-Powered Incident Management & Root Cause Analysis

ResolveAI is an AI-powered IT incident management system designed to help users analyze technical incidents, identify likely root causes, and generate actionable resolution recommendations.

The system combines a React/Vite frontend with a FastAPI backend and Google Gemini-based AI analysis.

Users can securely authenticate, submit an incident, and receive a structured diagnostic report containing incident classification, priority, root cause, recommended resolution, and incident status.

ResolveAI also provides an AI agent execution trace showing the steps performed during the incident analysis process.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Architecture Flow](#architecture-flow)
- [AI Analysis Workflow](#ai-analysis-workflow)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [API Reference](#api-reference)
- [Setup and Installation](#setup-and-installation)
- [Running the Application](#running-the-application)
- [Agent Execution Trace](#agent-execution-trace)
- [Security](#security)
- [Future Enhancements](#future-enhancements)
- [Project Status](#project-status)
- [License](#licence)

---

##  Overview

Traditional IT incident handling often requires support engineers to manually investigate symptoms, search previous incidents, identify possible causes, and determine appropriate resolution steps.

This process can be time-consuming and inconsistent.

**ResolveAI** automates the initial incident investigation process using AI.

A user can provide an incident in natural language, and ResolveAI analyzes the incident to generate a structured diagnostic report.

The system can identify:

- Incident category
- Incident priority
- Likely root cause
- Recommended resolution
- Incident status
- Relevant knowledge
- Similar incidents
- AI agent execution trace

---

##  Problem Statement

IT support teams frequently spend significant time investigating technical incidents.

Common challenges include:

- Manual incident classification
- Slow root-cause identification
- Searching previous incidents manually
- Repeating the same troubleshooting process
- Inconsistent troubleshooting recommendations
- Limited visibility into how an AI system reached its conclusion

ResolveAI addresses these challenges by providing an AI-assisted incident investigation workflow.

The goal is to help IT support teams perform initial incident analysis faster and in a more structured way.

---

##  Objectives

The main objectives of ResolveAI are:

1. Provide a secure incident analysis platform.
2. Allow authenticated users to submit IT incidents.
3. Automatically classify incidents using AI.
4. Identify the likely root cause.
5. Recommend appropriate resolution steps.
6. Search relevant knowledge during analysis.
7. Search for similar historical incidents.
8. Provide an AI execution trace for transparency.
9. Generate a unique ticket for each incident.
10. Allow users to resolve incidents or keep them open.

---

##  Key Features

###  AI-Powered Incident Analysis

Users can describe an IT incident using natural language.

ResolveAI uses Google Gemini to analyze the incident and generate a structured diagnostic report.

###  Automatic Incident Classification

The AI determines the incident category and priority based on the provided incident details.

Priority levels include:

- Low
- Medium
- High
- Critical

###  Root Cause Analysis

ResolveAI identifies the most likely technical root cause based on the incident description and available contextual information.

###  Resolution Recommendation

The system generates actionable troubleshooting and resolution recommendations.

###  Knowledge Search

The AI workflow searches the available knowledge base for relevant troubleshooting information.

###  Similar Incident Search

ResolveAI searches for incidents with similar symptoms to provide additional context during diagnosis.

### AI Agent Execution Trace

The application displays the steps performed during the AI analysis process.

Example:

```text
Incident received
       ↓
Incident analyzed
       ↓
Knowledge search
       ↓
Similar incident search
       ↓
Root cause analysis
       ↓
Resolution generation
       ↓
Diagnostic report completed

## System Architecture

ResolveAI follows a frontend–backend architecture with an AI-powered incident analysis workflow.

                    ┌───────────────────────┐
                    │        USER           │
                    │                       │
                    │  Login / Submit       │
                    │  Incident             │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   React + Vite        │
                    │      Frontend         │
                    │                       │
                    │ Incident Command      │
                    │ Center                │
                    └───────────┬───────────┘
                                │
                            REST API
                                │
                                ▼
                    ┌───────────────────────┐
                    │     FastAPI           │
                    │      Backend          │
                    │                       │
                    │ Authentication        │
                    │ Incident API          │
                    │ Ticket Management     │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │    AI Analysis        │
                    │                       │
                    │   Google Gemini       │
                    └───────────┬───────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
          ┌──────────────────┐    ┌────────────────────┐
          │ Knowledge Search │    │ Similar Incident   │
          │                  │    │ Search             │
          └────────┬─────────┘    └─────────┬──────────┘
                   │                        │
                   └────────────┬───────────┘
                                ▼
                    ┌───────────────────────┐
                    │ Diagnostic Report     │
                    │                       │
                    │ Category              │
                    │ Priority              │
                    │ Root Cause            │
                    │ Resolution            │
                    │ Status                │
                    │ Agent Trace           │
                    └───────────────────────┘

## Architecture Flow

1. The user logs into the ResolveAI application.
2. Authentication is handled using JWT-based authentication.
3. An authenticated user submits an IT incident.
4. The frontend sends the incident to the protected backend API.
5. The AI analysis engine processes the incident.
6. Relevant knowledge is searched to provide troubleshooting context.
7. Similar historical incidents are searched for additional context.
8. The system performs root cause analysis.
9. A recommended resolution is generated.
10. ResolveAI returns a structured diagnostic report and agent execution trace to the user.

## AI Analysis Workflow

ResolveAI follows a structured AI-assisted workflow for incident diagnosis.

Incident Submission
        ↓
Incident Analysis
        ↓
Incident Classification
        ↓
Knowledge Search
        ↓
Similar Incident Search
        ↓
Root Cause Analysis
        ↓
Resolution Generation
        ↓
Diagnostic Report
        ↓
Agent Execution Trace

1.Incident Analysis

The system analyzes the incident title and description to understand the reported problem and its symptoms.

2.Incident Classification

The AI determines the appropriate incident category and priority based on the information provided.

3.Knowledge Search

The system searches available troubleshooting knowledge for information relevant to the incident.

4.Similar Incident Search

The system searches previously analyzed incidents to identify similar problems and useful historical context.

5.Root Cause Analysis

The AI combines the incident information and available contextual information to determine the most likely root cause.

6.Resolution Generation

The AI generates recommended steps that can help troubleshoot and resolve the incident.

7.Diagnostic Report

The final analysis is presented as a structured diagnostic report for the user.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Frontend Tooling | Vite |
| Backend | FastAPI |
| Programming Language | Python |
| AI Model | Google Gemini |
| AI Integration | Google Generative AI |
| Database | SQLite |
| Authentication | JWT |
| HTTP Client | Axios |
| Data Validation | Pydantic |
| Knowledge Search | Internal Knowledge Base |
| Similar Incident Search | Incident Records |
| Environment Management | Python Virtual Environment |
| Version Control | Git & GitHub |

## Project Structure

Resolve AI/
│
├── Backend/
│   ├── __pycache__/
│   ├── __init__.py
│   ├── agent_planner.py
│   ├── agent_tools.py
│   ├── agent.py
│   ├── ai_analyzer.py
│   ├── api_test.py
│   ├── api.py
│   ├── app.py
│   ├── auth.py
│   ├── dashboard.py
│   ├── database.py
│   ├── init_database.py
│   ├── main.py
│   ├── prompt_builder.py
│   └── view_incidents.py
│
├── chroma_db/
│
├── frontend/
│   ├── node_modules/
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnalysisResult.jsx
│   │   │   ├── Badges.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── IncidentForm.jsx
│   │   │   ├── sidebar.jsx
│   │   │   └── StatePanels.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── AIAgent.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Settings.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   └── README.md
│
├── Rag/
│   ├── __pycache__/
│   │
│   ├── chroma_db/
│   │
│   ├── documents/
│   │
│   ├── knowledge_loader.py
│   ├── rag_pipeline.py
│   ├── retriever.py
│   └── vector_store.py
│
├── .venv/
│
├── venv/
│
├── .env
├── .gitignore
├── README.md
├── requirements.txt
└── resolveai.db

## Authentication

ResolveAI uses JWT-based authentication to protect the incident analysis functionality.

Authentication Flow:

User
  ↓
Login
  ↓
Credentials Validation
  ↓
JWT Token Generated
  ↓
Authenticated Session
  ↓
Protected API Access
  ↓
Incident Analysis

## API Reference

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Check whether the Resolve AI API is running |
| `GET` | `/health` | Check the health/status of the backend API |
| `POST` | `/analyze` | Analyze an incident/ticket using the AI pipeline and return category, priority, root cause, resolution, and status |
| `POST` | `/tickets/{ticket_id}/resolve` | Resolve a ticket and change its status to **Closed** |
| `POST` | `/tickets/{ticket_id}/keep-open` | Keep a ticket open and change its status to **Open** |


## Setup & Installation

### Prerequisites

- Python 3.12+
- Node.js + npm
- Google Gemini API key

### Backend Setup

From the project root, create and activate the virtual environment:

```bash
python -m venv .venv

Activate the virtual environment on Windows:

.venv\Scripts\activate

Install the required backend packages:

python -m pip install fastapi uvicorn python-dotenv google-genai python-jose pwdlib pydantic

Environment Variables

Create a .env file in the project root:

GEMINI_API_KEY=your_gemini_api_key

Replace your_gemini_api_key with your actual Google Gemini API key.

Frontend Setup

Open a new terminal and navigate to the frontend:

cd frontend

Install the frontend dependencies:

npm install

## Running the Application

The application requires the backend and frontend to run simultaneously.

Terminal 1 — Backend

From the project root:

uvicorn Backend.main:app --reload

The backend runs at:

http://127.0.0.1:8000

Interactive API documentation:

http://127.0.0.1:8000/docs

Terminal 2 — Frontend

From the project root:

cd frontend
npm run dev

The frontend runs at:

http://localhost:5173

Open the frontend URL in your browser to use Resolve AI.

Project Components

* Backend — FastAPI API, authentication, database and AI analysis
* Frontend — React/Vite user interface
* RAG — Knowledge retrieval and similar-incident search
* SQLite — Stores users, incidents, attachments and authentication-related data
* Gemini AI — Generates the incident analysis and diagnostic report

Application Flow: 

Start Backend
      ↓
Start Frontend
      ↓
Open ResolveAI
      ↓
Login
      ↓
Report Incident
      ↓
Analyze Incident
      ↓
View Diagnostic Report
      ↓
Review / Resolve Incident

## Agent Execution Trace

ResolveAI provides visibility into the AI analysis process through an execution trace.

Incident received
       ↓
Incident analyzed
       ↓
Knowledge search
       ↓
Similar incident search
       ↓
Root cause analysis
       ↓
Resolution generation
       ↓
Diagnostic report completed

## Security

ResolveAI includes authentication and protected API access.

Security features include:

* JWT-based authentication
* Protected incident analysis endpoint
* Password hashing
* Authentication-required incident analysis
* Environment-based configuration for sensitive credentials

Sensitive information such as API keys, passwords and secret keys should not be committed to the repository.

A .gitignore file should be used to prevent sensitive and unnecessary files from being uploaded to GitHub.

## Future Enhancements

Possible future enhancements include:

* Real-time monitoring integration
* Integration with enterprise incident management platforms
* Automated log analysis
* Automated alert ingestion
* Advanced historical incident retrieval
* Incident severity prediction
* Automated remediation workflows
* Support for additional AI models
* Production deployment
* Improved monitoring and observability
* Advanced incident analytics and dashboards

## Project Status

ResolveAI currently provides a working prototype of an AI-powered IT incident management and root cause analysis system.

Implemented Features

* User authentication
* JWT-based protected API
* Incident submission
* AI-powered incident analysis
* Automatic incident classification
* Priority identification
* Knowledge search
* Similar incident search
* Root cause analysis
* Resolution recommendation
* Diagnostic report generation
* Unique incident ticket generation
* Incident status management
* AI agent execution trace
* React/Vite Incident Command Center
* FastAPI backend
* Google Gemini AI integration

The project is currently focused on completing documentation and preparing the application for further enhancements.

## License

This project was built as a personal portfolio and interview-preparation project.

It is intended for demonstration and educational purposes, showcasing an AI-powered incident analysis workflow with authentication, RAG-based retrieval, and agent-based diagnostic analysis.

The source code is provided for personal learning and demonstration purposes. Please do not use, redistribute, or present this project as your own work without permission.