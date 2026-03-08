# SQL Web Editor (CipherSQLStudio)

A full-stack web application designed for interactive SQL practice, complete with real-time query execution, automated grading, user authentication, and a lightning-fast sandbox environment. 

## 🚀 Features

*   **Interactive SQL Editor:** Utilize the robust Monaco Editor for a modern SQL writing experience featuring full syntax-highlighting.
*   **Temporary Tables Sandbox:** Each query is executed inside an isolated **PostgreSQL Temporary Table** environment. Queries are wrapped in a strictly isolated transaction with a `SET LOCAL search_path TO pg_temp` guarantee, ensuring students can never see or mutate global data.
*   **Progress Tracking & Intelligent Grading:** Verify executing queries against accurate test answers automatically, storing success/failure attempts and persistent code to the student's unique user profile.
*   **AI Hint System (Gemini LLM):** Leverage Google's Gemini AI to dynamically orchestrate intelligent, context-aware SQL hints when users get stuck.
*   **High-Performance Rate Limiting:** Powered by Redis sliding-window limiters, protecting AI generation and core sandbox functionality from abuse and brute-force events.
*   **Secure Authentication:** User identity management leveraging encrypted JWT tokens stored in `httpOnly` secure cookies.
*   **Dynamic Data Pipeline:** Supports complex SQL problems across Easy, Medium, and Hard assignments with robust automated table-rendering ensuring fresh scenarios.

---

## 🛠 Technology Choices

### Frontend (User Interface)
*   **React & Vite:** Chosen for incredible developer experience and efficient component rendering.
*   **Redux Toolkit & RTK Thunk:** Centralized global management guarantees predictable UI state tracking specifically concerning code-progress, attempts persistence, and authenticated user boundaries. 
*   **Monaco Editor:** A browser-native version of VS-Code's core editor delivering top-tier syntax-highlighting.
*   **SCSS:** Scalable CSS managing variables mapping global UI design sets with BEM methodology.

### Backend (Server & API Routes)
*   **Node.js & Express:** Lightweight request handler optimized for high-concurrency sandbox execution.
*   **Zod:** Rigid schema-validation ensuring robust protection from malicious payload mapping.   
*   **JWT Security:** Fully-isolated authentication mapping cookies ensuring API routing validation via `httpOnly` safeguards.

### Database Architecture
*   **MongoDB (Primary Store):** Flexible NoSQL architecture for modeling nested SQL Assignment logic, tags, and highly-variable user-execution progress metrics.
*   **PostgreSQL (Sandbox Runner):** Acts as our query-testing platform using a **Temporary Tables Strategy**. 
    *   **Isolation:** Every request spawns connection-exclusive `TEMP` tables that exist only for the lifespan of that single request.
    *   **Security:** We employ a `SET LOCAL search_path TO pg_temp;` command at the start of every transaction, effectively "blinding" the runner role from the `public` schema.
    *   **Guaranteed Cleanup:** Tables are created with `ON COMMIT DROP`. Regardless of success or failure, the `finally { DISCARD ALL; }` block ensures zero connection-state leakage between students.
*   **Redis:** High-performance, in-memory store used exclusively for **Sliding Window Rate Limiting** to protect high-cost AI operations.

---

## 🏗 System Architecture

### 1. High-Level Component Flow
```mermaid
graph TD
    Client[Client Browser] <-->|REST API| Backend[Node.js Backend]
    
    Backend <-->|Rate Limiting| Redis[Redis Cache]
    Backend <-->|User & Execution Progress| MongoDB[(MongoDB)]
    
    Backend -->|Isolated Sandbox Connection| Postgres[(PostgreSQL)]
    
    Worker[Cleanup Worker] -->|Log Archive Cron| SharedLogs[(Log Volume)]
```

### 2. Execution Sequence (Sandbox)
```mermaid
flowchart TD
    User([User]) -->|Run Query| API[Backend API]
    API --> Token{Token Valid?}
    Token -- No --> 401Err[/401 Unauthorized/]
    
    Token -- Yes --> Rate{Rate Limit?}
    Rate -- Yes --> 429Err[/429 Too Many Requests/]
    
    Rate -- No --> Valid{Valid Query?}
    Valid -- No --> 400Err[/400 Bad Request/]
    
    Valid -- Yes --> Conn[Check out Pool Connection]
    Conn --> StartTx[BEGIN TRANSACTION]
    StartTx --> SearchPath[SET LOCAL search_path TO pg_temp]
    
    SearchPath --> Seed[CREATE TEMP TABLE ... ON COMMIT DROP]
    Seed --> UserExec[Execute Student SQL]
    
    UserExec --> Grade[Grade Result vs Expected]
    Grade --> Rollback[ROLLBACK TRANSACTION]
    Rollback --> Discard[DISCARD ALL]
    Discard --> Release[Release Connection to Pool]
    Release --> Ret[/Return Graded Results/]
```

---

## ⚙️ Environment Setup

### Backend (`/backend/.env`)

```env
PORT=3000
MONGODB_URI=mongodb://admin:password@mongodb:27017/ciphersqlstudio?authSource=admin
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB_NAME=ciphersqlstudio_app
RUNNER_USER=read_write_runner
RUNNER_PASSWORD=runner_password
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://redis:6379
GEMINI_API_KEY=your_gemini_key
```

### Frontend (`/frontend/.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🚢 Installation & Run Guide (Docker)

1.  **Clone the Repository:**
    ```bash
    git clone --config core.autocrlf=false https://github.com/AyusGup/sql-web-editor.git
    cd sql-web-editor
    ```

2.  **Deploy via Docker Compose:**
    ```bash
    docker-compose up --build
    ```

3.  **Seed Assignment Data:**
    ```bash
    cd backend
    pnpm install
    pnpm run seed
    ```

4.  **Access the App:**
    The application will be available via the Caddy proxy at your configured domain or `http://localhost:3000`.
