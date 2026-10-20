# Company News Processing Dashboard

A modern full-stack web application designed to store, manage, filter, and view company news articles. Built with a **Python FastAPI** backend leveraging the **Repository Pattern** with **PostgreSQL 16 Alpine** (via Docker Compose) and a responsive **React + TypeScript** frontend powered by **Redux Toolkit (RTK Query)**, **Ant Design**, and **Lucide Icons**.

---

## Architecture Overview

```
                      +---------------------------------------+
                      |       React + TypeScript Client       |
                      |   (Ant Design v6 + Lucide Icons)      |
                      +---------------------------------------+
                                          |
                                          | RTK Query HTTP Calls
                                          v
                      +---------------------------------------+
                      |         FastAPI REST API              |
                      |  - Unified Response Envelope          |
                      |  - Centralized Exception Handlers     |
                      +---------------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |          Article Service              |
                      |    (Business Logic & Validation)      |
                      +---------------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |        Article Repository             |
                      |       (Repository Pattern)            |
                      +---------------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |      SQLAlchemy 2.0 ORM / Alembic     |
                      +---------------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |   PostgreSQL 16 Alpine (Docker)       |
                      +---------------------------------------+
```

---

## Tech Stack

### Backend
* **Language & Runtime:** Python 3.11+
* **Web Framework:** [FastAPI](https://fastapi.tiangolo.com/)
* **ORM:** [SQLAlchemy 2.0](https://www.sqlalchemy.org/)
* **Schema Migrations:** [Alembic](https://alembic.sqlalchemy.org/)
* **Data Validation:** [Pydantic v2](https://docs.pydantic.dev/) & `pydantic-settings`
* **Driver:** `psycopg2-binary`
* **Testing:** [Pytest](https://docs.pytest.org/) & `TestClient` (`httpx`)

### Frontend
* **Core:** React 19 + TypeScript + [Vite](https://vite.dev/)
* **State Management & Data Fetching:** [Redux Toolkit (RTK Query)](https://redux-toolkit.js.org/)
* **UI Components:** [Ant Design (antd)](https://ant.design/)
* **Icons:** [Lucide React](https://lucide.dev/)

### DevOps & Database
* **Database:** PostgreSQL 16 Alpine
* **Containerization:** Docker & Docker Compose

---

## Key Features

1. **Repository Pattern:**
   * Clean separation of concerns: API Routes -> Service Layer -> Repository Layer -> SQLAlchemy ORM.
   * Database queries are decoupled from business logic and endpoint handling.

2. **Unified API Response Architecture:**
   * Every endpoint returns a consistent JSON envelope for both successes and errors:
     ```json
     {
       "status": "success" | "error",
       "message": "Human-readable description",
       "data": { ... } | [ ... ] | null,
       "meta": {
         "page": 1,
         "page_size": 10,
         "total": 42,
         "total_pages": 5
       } | null
     }
     ```

3. **Centralized Exception Handling:**
   * Catches `RequestValidationError` and formats field-level validation errors into clean, structured arrays.
   * Safely captures database errors (`SQLAlchemyError`) and internal exceptions (`500`) without exposing internal stack traces.
   * Handles 404 (Resource Not Found) and custom application exceptions uniformly.

4. **Phase 1 Compliance:**
   * Model includes `category` and `summary` fields, but leaves both explicitly set to `NULL` upon creation.
   * Classification and summarization logic are deferred to Phase 2.

5. **Article Management Interface:**
   * **Creation Modal:** Real-time form validation for company name, headline, URL, and article body.
   * **Data Table:** Ant Design table with status badges (`PENDING`, `PROCESSED`), external links, and full pagination.
   * **Real-time Filters:** Search by company name (with 400ms debounce) and filter by processing status.
   * **Details Drawer:** Slide-out drawer displaying full article body and Phase 2 status badges.
   * **Metric Cards:** Overview summary displaying total articles and pending queue counts.

---

## Project Structure

```
Practicle_Test/
├── docker-compose.yml             # PostgreSQL 16 Alpine service definition
├── .gitignore                     # Configured gitignore (ignores venv, modules, docs)
├── README.md                      # Project documentation
│
├── backend/                       # FastAPI application
│   ├── alembic/                   # Database migrations
│   │   ├── versions/              # Migration revision scripts
│   │   └── env.py                 # Dynamic Alembic environment
│   ├── alembic.ini                # Alembic configuration
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py            # Dependency injection
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   └── articles.py # Article REST endpoints
│   │   │       └── router.py      # v1 router aggregator
│   │   ├── core/
│   │   │   ├── config.py          # Pydantic environment settings
│   │   │   ├── exceptions.py      # Custom exception classes
│   │   │   └── handlers.py        # Centralized exception handlers
│   │   ├── db/
│   │   │   ├── base.py            # Declarative base
│   │   │   └── session.py         # Engine and sessionmaker
│   │   ├── models/
│   │   │   └── article.py         # SQLAlchemy Article model
│   │   ├── repositories/
│   │   │   ├── base.py            # Generic base repository
│   │   │   └── article_repository.py # Article CRUD operations
│   │   ├── schemas/
│   │   │   ├── article.py         # Pydantic schemas (Create, Response)
│   │   │   └── response.py        # Standardized ApiResponse & PaginationMeta
│   │   ├── services/
│   │   │   └── article_service.py # Business rules & pagination logic
│   │   └── main.py                # FastAPI entrypoint, CORS & middleware
│   ├── tests/
│   │   ├── conftest.py            # Pytest fixtures and test database setup
│   │   ├── test_articles.py       # Article endpoint integration tests
│   │   └── test_exception_handling.py # Error handling & 500 tests
│   ├── .env                       # Local environment file
│   ├── .env.example               # Example environment template
│   └── requirements.txt           # Python dependencies
│
└── frontend/                      # React + TypeScript Vite application
    ├── src/
    │   ├── components/
    │   │   ├── ArticleDetailDrawer.tsx # Article details slide-out drawer
    │   │   ├── ArticleFilters.tsx      # Search & status filter toolbar
    │   │   ├── ArticleTable.tsx        # Ant Design data table with pagination
    │   │   ├── CreateArticleModal.tsx  # Article creation modal form
    │   │   ├── Navbar.tsx              # Navigation header
    │   │   └── StatsCards.tsx          # Summary metric cards
    │   ├── store/
    │   │   ├── services/
    │   │   │   └── articlesApi.ts      # RTK Query service
    │   │   └── index.ts                # Redux store configuration
    │   ├── types/
    │   │   └── article.ts              # TypeScript type definitions
    │   ├── App.tsx                     # Main layout and dashboard coordinator
    │   ├── index.css                   # Global styles and resets
    │   └── main.tsx                    # React root with Redux Provider
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts                  # Vite config with API proxy
```

---

## Setup & Running Guide

### Prerequisites
* **Docker & Docker Compose** (ensure Docker Desktop is running)
* **Python 3.11+**
* **Node.js 18+ & npm**

---

### Step 1: Start PostgreSQL Database
From the root project directory:
```powershell
docker compose up -d
```
Verify the container is healthy:
```powershell
docker ps
```
The container `company_news_db` will be running on `0.0.0.0:5432`.

---

### Step 2: Configure & Start Backend

1. **Activate or create a virtual environment:**
   ```powershell
   # From root:
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

2. **Install Python dependencies:**
   ```powershell
   pip install -r backend\requirements.txt
   ```

3. **Verify `.env` configuration:**
   The `backend/.env` file is pre-configured with:
   ```dotenv
   PROJECT_NAME="Company News Processing API"
   API_V1_STR="/api/v1"
   BACKEND_CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
   DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/company_news
   ```

4. **Apply Alembic Migrations:**
   ```powershell
   cd backend
   ..\venv\Scripts\alembic.exe upgrade head
   ```

5. **Start the FastAPI Development Server:**
   ```powershell
   ..\venv\Scripts\uvicorn.exe app.main:app --reload --port 8000
   ```
   * Interactive Swagger Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
   * Alternative ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
   * Health Check: [http://localhost:8000/health](http://localhost:8000/health)

---

### Step 3: Start the Frontend Application

1. Open a new terminal and navigate to `frontend/`:
   ```powershell
   cd frontend
   ```

2. **Install frontend dependencies:**
   ```powershell
   npm install
   ```

3. **Start the Vite development server:**
   ```powershell
   npm run dev
   ```
   Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## API Endpoints

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | API Healthcheck | `200 OK` |
| `POST` | `/api/v1/articles` | Creates a new article (`category` and `summary` are set to `null`) | `201 Created` |
| `GET` | `/api/v1/articles` | Retrieves paginated articles with optional filters (`company_name`, `status`, `page`, `page_size`) | `200 OK` |
| `GET` | `/api/v1/articles/{id}` | Retrieves a single article by its primary key ID | `200 OK` / `404 Not Found` |

### Sample `POST /api/v1/articles` Request
```json
{
  "company_name": "Google",
  "title": "Google announces new AI advancements",
  "url": "https://news.google.com/articles/123",
  "content": "Google has announced significant milestones in their latest generative AI models."
}
```

### Sample Response (`201 Created`)
```json
{
  "status": "success",
  "message": "Article created successfully",
  "data": {
    "id": 1,
    "company_name": "Google",
    "title": "Google announces new AI advancements",
    "url": "https://news.google.com/articles/123",
    "content": "Google has announced significant milestones in their latest generative AI models.",
    "status": "PENDING",
    "category": null,
    "summary": null,
    "created_at": "2026-10-20T10:03:30.867017Z"
  },
  "meta": null
}
```

---

## Testing & Quality Assurance

### Run Backend Pytest Suite
```powershell
cd backend
..\venv\Scripts\pytest.exe -v
```
**Test coverage includes:**
* Successful article creation with default status and null category/summary.
* Input validation failures returning `422` with structured error details.
* Article retrieval by ID (existing and 404 non-existent).
* Pagination logic (page size, page number, total count).
* Filtering by company name (case-insensitive substring) and status.
* Centralized exception handlers for custom application exceptions and unhandled crashes.

### Frontend Type-Checking & Linting
```powershell
cd frontend
npm run lint    # ESLint verification (0 errors)
npm run build   # TypeScript compilation & production bundle verification
```

---

## Phase 2 Roadmap

* **Asynchronous Task Queue:** Setup Celery workers backed by Redis for offloading heavy tasks.
* **Classification Pipeline:** Automatically categorize articles (e.g. Technology, Finance, Healthcare, Politics).
* **Summarization Engine:** Generate concise extractive or abstractive summaries for article content.
* **Live Status Updates:** Real-time UI updates (via WebSockets or polling) transitioning articles from `PENDING` to `PROCESSED`.

