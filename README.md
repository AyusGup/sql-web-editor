# SQL Web Editor (CipherSQLStudio)

A full-stack web application designed for interactive SQL practice, complete with real-time query execution, automated grading, user authentication, and a robust sandbox environment. 

## 🚀 Features

*   **Interactive SQL Editor:** Utilize the robust Monaco Editor for a modern SQL writing experience featuring full syntax-highlighting.
*   **Real-time Sandbox Execution:** Each query is piped securely into an isolated PostgreSQL schema environment directly executing user SQL against generated dummy data in real-time.
*   **Progress Tracking & Intelligent Grading:** Verify executing queries against accurate test answers automatically storing success/failure attempts & persistent code to the student's unique user profile.
*   **AI Hint System (Gemini LLM):** Leverage Google's Gemini AI to dynamically orchestrate intelligent, context-aware SQL hints when users get stuck.
*   **Strict Rate Limiting:** Built alongside Redis queues, ensuring AI generations and core sandbox functionalities are strongly protected against API-spamming and brute-force events.
*   **Secure Authentication:** Secure user identity management leveraging encrypted JWT tokens across secure cookies ensuring privacy.
*   **Dynamic Data Pipeline:** Supports complex SQL problems across Easy, Medium, and Hard assignments with robust automated schema-rendering ensuring fresh scenarios.

---

## 🛠 Technology Choices

### Frontend (User Interface)
*   **React & Vite:** Chosen for incredible developer experience and efficient component rendering.
*   **Redux Toolkit & RTK Thunk:** Centralized global management guarantees predictable UI state tracking specifically concerning code-progress, attempts persistence, and authenticated user boundaries. 
*   **Monaco Editor:** A browser-native version of VS-Code's core editor delivering top-tier syntax-highlighting natively mapping out SQL features flawlessly out-of-the-box.
*   **SCSS:** Scalable CSS managing variables mapping global UI design sets. BEM class name logic enforces unpolluted, readable boundaries isolated cleanly across components leveraging custom built glass-morphism and mobile responsibilities. 

### Backend (Server & API Routes)
*   **Node.js & Express:** Lightweight request handler optimizing complex JSON responses mapping sandbox executions immediately for instant grading loops.
*   **Zod:** Used rigidly inside API schema-validation. Ensures robust protection from malicious payload mapping before data even approaches a container.   
*   **JWT Security:** Fully-isolated authentication mapping cookies ensuring API routing validation via `httpOnly` safeguards completely protected from XSS.

### Database Architecture
*   **MongoDB (Primary Store):** Flexible NoSQL architecture specifically advantageous for modeling nested SQL Assignment logic, tags parameters, and storing highly-variable user-execution progress metrics reliably.
*   **PostgreSQL (Sandbox Runner):** Acts completely autonomously as our query-testing platform. Temporary schemas are generated continuously isolating multi-user SQL queries against the exact environments required avoiding persistence clashes. We employ a strict **Dual-User Strategy** where structural environments are crafted using an administrative pool, but user-queries execute explicitly via a locked-down `runner` role lacking superuser privileges. Additionally, it securely utilizes a **transactional rollback strategy** (`BEGIN` ... `ROLLBACK`) to guarantee that potentially destructive user queries never mutate the underlying database state permanently.
*   **Redis:** High-performance, in-memory caching specifically leveraging asynchronous data cues. We leverage **custom Lua scripts** directly within Redis to execute complex, atomic operations (like robust rate-limiting and messaging) guaranteeing zero race conditions. 

### Worker Infrastructure (Background Processes)
*   **BullMQ:** Maps a high-performance messaging-queue mapping cleanup executions asynchronously targeting our PostgreSQL engine. We chose BullMQ over traditional `cron` jobs because it provides robust distributed job tracking, built-in retry mechanisms, active concurrency control, and seamless Redis integration—vital assurances that standard cron utilities lack when scaling across concurrent microservices.

---

## ⚙️ Environment Setup

Before starting the project, ensure you have the following `.env` configurations set exactly in their respective directory paths.

### Backend (`/backend/.env`)

```env
PORT=3000
MONGODB_URI=mongodb://admin:password@mongodb:27017/ciphersqlstudio?authSource=admin
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=ciphersqlstudio_app
POSTGRES_PORT=5432
# If running via docker networks use "postgres", if directly running locally use "localhost"
POSTGRES_HOST=postgres
# Runner user purely for Sandbox Execution restrictions
RUNNER_USER=read_write_runner
RUNNER_PASSWORD=runner@123
JWT_SECRET=super_secret_jwt_key_here
REDIS_HOST=redis
REDIS_PORT=6379
NODE_ENV=development
```

### Frontend (`/frontend/.env`)

```env
# URL where your backend express server is hosted
VITE_API_URL=http://localhost:3000/api
NODE_ENV=development
```

### Worker (`/worker/.env`)

```env
REDIS_HOST=redis
REDIS_PORT=6379
NODE_ENV=development
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=ciphersqlstudio_app
POSTGRES_PORT=5432
POSTGRES_HOST=postgres
```

---

## 🚢 Installation & Run Guide (Docker Recommended)

The most reliable way to instantiate this project comprehensively alongside all requisite architectures (Mongo, Redis, PostgreSQL, Node) is utilizing **Docker Compose**. 

### Prerequisites:
1.  Ensure [Docker Desktop](https://www.docker.com/products/docker-desktop) is fully installed and tracking locally.

### Steps:

1.  **Clone the Repository:**
    *(Note: This project relies on shell scripts configured with `LF` line endings. To avoid bash execution errors inside Docker containers on Windows, ensure Git doesn't automatically convert them to `CRLF`.)*
    ```bash
    git clone --config core.autocrlf=false https://github.com/AyusGup/sql-web-editor.git
    cd sql-web-editor
    ```

2.  **Add Enironment configurations:**
    Ensure you added the three `.env` files respectively across `/frontend`, `/backend`, and `/worker` referencing the formats showcased above.

3.  **Deploy Docker Compose:**
    Compile the entire application suite encompassing the backend API schema logic alongside backend workers mapping Redis, PostgreSQL & MongoDB environments dynamically. 
    ```bash
    docker-compose up --build
    ```

4.  **Seed Assignment Data:**
    Initially your application will not possess questions to render! Keep the primary Docker terminal tracking alive in the background and open a secondary terminal at the root. Trigger the seeder utility via:
    ```bash
    cd backend
    pnpm install
    pnpm run seed
    ```

5.  **Initialize the Frontend (Locally tracking):**
    While the backend connects inside Docker, you can run the lightning-fast Vite module explicitly running hot-module replacements mapping UI components easily without waiting on Docker iterations. 
    ```bash
    cd frontend
    pnpm install
    pnpm dev
    ```

The application will map successfully available via `http://localhost:5173`.

---

## 🎥 Video Demonstration

Watch the comprehensive video walkthrough demonstrating the application features, real-time query execution, and core architecture:

[![Watch the Demo](https://img.youtube.com/vi/07eoEr6G7tA/hqdefault.jpg)](https://youtu.be/07eoEr6G7tA)

*(Click the thumbnail to play the video on YouTube)*

---

## 🏗 System Architecture Diagrams

Based on the core implementations, here are the exact architectural flows driving the engine.

### 1. High-Level Component Architecture
```mermaid
graph TD
    Client[Client Browser] <-->|REST API| Backend[Node.js Backend]
    
    Backend -->|Job Queueing| BullMQ[BullMQ]
    BullMQ <--> Redis[Redis Cache / Queue]
    
    Backend <-->|Rate Limit & Schema Cache TTL| Redis
    Backend <-->|User & Execution Progress| MongoDB[(MongoDB - Primary Store)]
    
    Backend -->|Execution via runnerPool| Postgres[(PostgreSQL - Sandbox Runner)]
    Backend -->|Setup via adminPool| Postgres
    
    Worker[Cleanup Worker Node] <-->|Consume Jobs| Redis
    Worker -->|Drop Schemas via adminPool| Postgres
```

### 2. User Action Sequence Flow
*Note: I refined the execution pipeline from the original handwritten diagrams to explicitly capture the new `Dual-User Strategy` where restricted permissions are actively granted to the runner, and executing queries are forced securely inside `ROLLBACK` transactions to prevent database persistence.*

```mermaid
flowchart TD
    User([User])
    
    User -->|Ask for Hint| Hint[Ask for Hint]
    Hint --> TokenHint{Token Valid?}
    TokenHint -- No --> 401Hint[/401 Unauthorized/]
    TokenHint -- Yes --> RateLimit{Rate Limit?}
    RateLimit -- Yes --> 429Hint[/429 Too Many Requests/]
    RateLimit -- No --> GenHint[Generate Hint via Gemini LLM]
    GenHint --> RetHint[/Return Hint/]
    
    User -->|Write Query| Write[Write Query]
    Write --> WWReq[Web Worker Req for Autosave]
    WWReq --> TokenSave{Token Valid?}
    TokenSave -- No --> 401Save[/401 Unauthorized/]
    TokenSave -- Yes --> SaveDB[Save Progress in MongoDB]
    
    User -->|Run Query| Run[Execute Target Query]
    Run --> TokenRun{Token Valid?}
    TokenRun -- No --> 401Run[/401 Unauthorized/]
    TokenRun -- Yes --> Validation{Query Passes Regex?}
    Validation -- No --> 400Run[/400 Bad Request/]
    Validation -- Yes --> SchemaEx{Schema Exists in Cache?}
    
    SchemaEx -- Yes --> UpdTTL[Update TTL in Redis]
    UpdTTL --> Resched[Reschedule Destruction Job]
    Resched --> ExecQ
    
    SchemaEx -- No --> CreateSch[Create Schema via Admin Pool]
    CreateSch --> GrantPriv[Grant DB Privileges to Runner Role]
    GrantPriv --> SeedData[Seed Dummy Data in Schema]
    SeedData --> AddMeta[Add Schema metadata to Redis Cache]
    AddMeta --> SchedJob[Schedule Destruction Job in BullMQ]
    SchedJob --> ExecQ
    
    ExecQ[Execute SQL via Runner Pool]
    ExecQ --> Rollback((Transaction ROLLBACK))
    Rollback --> RetRes[/Return Graded Sandbox Result/]
```
