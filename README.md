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
