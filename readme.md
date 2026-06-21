# 🎬 Movies API

A Node.js REST API for managing movies, built as a practice project to connect with **Azure SQL Database** and to experiment with **Docker** and **Kubernetes** deployments.

---

## 🙏 Credits & References

This project is based on the original work by Miguel Ángel Durán.  
You can find the source project here: [\[curso node by midudev\]](https://github.com/midudev/curso-node-js).

This extension is intended for practice with **nodejs**, **Azure SQL Database**, **Docker**, and **Kubernetes**.

---

## 🚀 Features
- CRUD operations for movies (Title, Year, Director, Duration, Poster, Rate).
- Secure database connection using environment variables (`.env`).
- UUID (`uniqueidentifier`) auto-generated for each movie record.
- Ready for containerization with Docker.
- Deployment practice on Azure Kubernetes Service (AKS).

---

## 🛠️ Tech Stack
- **Node.js** (ES Modules + async/await)
- **Express.js** for API routing
- **mssql** driver for SQL Server
- **Azure SQL Database** backend
- **Docker** for containerization
- **Kubernetes** for orchestration

---

## ⚙️ Setup

### 1. Clone the repo and install dependencies
```bash
git clone https://github.com/yourusername/movies-api.git
cd movies-api
npm install
```

---

## ▶️ Run Locally

After cloning and installing dependencies, you can start the API server:

```bash
npm run start
```

## 🐳 Run with Docker

If you have Docker installed, you can build and run the API inside a container:

### Build the image
```bash
docker build -t movies-api .
docker run -d -p 8080:8080 --name movies-api movies-api
```

### Check http://localhost:8080

### Stop and remove container
docker stop movies-api
docker rm movies-api

### Remove the image
docker rmi movies-api
