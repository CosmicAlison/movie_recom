
# PicFlix — Microservice-Based Movie Recommendation Platform

PicFlix is a modular movie recommendation system built using **microservices** for scalability and maintainability. It delivers personalized movie suggestions and allows users to interact with them through authentication-enabled features like “hearting” and saving recommended movies.

---

## 🧩 Project Structure



root/
│
├── auth-service/ # Express.js authentication and user management service
│ ├── Dockerfile
│ ├── package.json
│ └── src/
│
├── recommendation-service/ # Flask-based recommendation engine
│ ├── Dockerfile
│ ├── requirements.txt
│ ├── precompute_embeddings.py # Generates prebuilt TF-IDF/embedding files
│ └── main.py
│
├── frontend/ # React (Vite or Next.js) web client
│ ├── Dockerfile
│ ├── package.json
│ └── src/
│
└── docker-compose.yml # Coordinates all services in development


---

## ⚙️ Overview

### 1. **Recommendation Service**
- Built with **Flask (Python)** and uses **TF-IDF** vectorization + cosine similarity.
- Precomputes embeddings from a TMDB-derived dataset for fast lookups.
- Returns top 15 recommendations based on user-selected genres, themes, and movie age.
- Containerized with Docker for consistent deployment.

### 2. **Auth Service**
- Built with **Node.js / Express**.
- Handles user registration, login, and JWT-based authentication.
- Stores and retrieves liked movies (“hearts”) for authenticated users.
- Communicates with the recommendation service through internal network routes (via Docker).

### 3. **Frontend**
- Built with **React** (or Next.js, depending on setup).
- Provides the user interface for searching, viewing recommendations, and managing favorites.
- Calls the Auth and Recommendation services via REST API endpoints.

---

## 🚀 Running Locally with Docker

Make sure you have **Docker** and **Docker Compose** installed.

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/picflix.git
   cd picflix


Build and start all services:

docker-compose up --build


Once everything is running:

Frontend: http://localhost:3000

Auth Service: http://localhost:4000

Recommendation Service: http://localhost:5000

🧠 Key Features

Microservice architecture for scalability

Movie recommendation engine powered by NLP (TF-IDF & cosine similarity)

User authentication with JWT

Persistent favorites & interaction tracking

Fully containerized using Docker