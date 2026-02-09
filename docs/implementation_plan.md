# NotebookLM-Inspired Fullstack Learning Project - Comprehensive Roadmap

> **Vai trò của tôi**: Mentor/Tech Lead hướng dẫn bạn từng bước, KHÔNG code hộ
> **Mục tiêu**: Bạn tự tay code, hiểu sâu mọi layer, sẵn sàng đi làm

---

## 1. Tổng Quan Kiến Trúc

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │   React + TypeScript + TailwindCSS                          │    │
│  │   • Auth Pages (Login/Register)                              │    │
│  │   • Notebook Dashboard                                        │    │
│  │   • Source Manager (Upload/List)                             │    │
│  │   • Chat Interface với Citations                              │    │
│  │   • Notes Editor                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │ REST API (JSON)                       │
└──────────────────────────────┼──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                                  │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │   Spring Boot + Spring Security                              │    │
│  │   • JWT Authentication Filter                                 │    │
│  │   • CORS Configuration                                        │    │
│  │   • Rate Limiting                                             │    │
│  │   • Request Validation                                        │    │
│  └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────────┼──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BUSINESS LAYER                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐  │
│  │ AuthService  │ │NotebookSvc   │ │ SourceSvc    │ │ ChatService│  │
│  │              │ │              │ │              │ │            │  │
│  │• register()  │ │• create()    │ │• list()      │ │• ask()     │  │
│  │• login()     │ │• list()      │ │• upload()    │ │• retrieve()│  │
│  │• refresh()   │ │• update()    │ │• parse()     │ │• generate()│  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘  │
│  ┌──────────────┐ ┌──────────────┐                                   │
│  │ NoteService  │ │ RAGPipeline  │                                   │
│  │              │ │              │                                   │
│  │• create()    │ │• embed()     │                                   │
│  │• linkCite()  │ │• search()    │                                   │
│  └──────────────┘ └──────────────┘                                   │
└──────────────────────────────┼──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                      │
│  ┌──────────────────────┐    ┌──────────────────────┐               │
│  │   MySQL Database     │    │   File Storage       │               │
│  │   • Users            │    │   • PDF files        │               │
│  │   • Notebooks        │    │   • Extracted text   │               │
│  │   • Sources          │    │                      │               │
│  │   • Chunks           │    └──────────────────────┘               │
│  │   • Notes            │                                            │
│  │   • ChatHistory      │    ┌──────────────────────┐               │
│  └──────────────────────┘    │   LLM API            │               │
│                              │   • OpenAI / Gemini  │               │
│                              │   • Embeddings       │               │
│                              └──────────────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Folder Structure Đề Xuất

**Frontend (React + TypeScript)**
```
frontend/
├── src/
│   ├── api/           # API client functions
│   ├── components/    # Reusable UI components
│   ├── contexts/      # React Context (Auth, Theme)
│   ├── hooks/         # Custom hooks
│   ├── pages/         # Page components
│   ├── types/         # TypeScript interfaces
│   ├── utils/         # Helper functions
│   └── App.tsx
├── public/
├── package.json
└── tsconfig.json
```

**Backend (Spring Boot)**
```
backend/
├── src/main/java/com/yourname/notebookclone/
│   ├── config/        # Security, CORS, JWT config
│   ├── controller/    # REST Controllers
│   ├── dto/           # Request/Response DTOs
│   ├── entity/        # JPA Entities
│   ├── exception/     # Custom exceptions
│   ├── repository/    # JPA Repositories
│   ├── service/       # Business logic
│   └── util/          # Utility classes
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/  # Flyway scripts
└── pom.xml
```

### 1.3 Tại Sao Chọn Kiến Trúc Này?

| Quyết định | Lý do | Alternative |
|------------|-------|-------------|
| **Layered Architecture** | Dễ hiểu, phổ biến trong công ty, tách biệt concerns | Hexagonal (phức tạp hơn) |
| **REST API** | Standard, dễ test với Postman, tài liệu nhiều | GraphQL (learning curve cao) |
| **JWT** | Stateless, scale tốt, phổ biến | Session-based (cần sticky session) |
| **MySQL** | Quan hệ rõ ràng, SQL standard, free tier nhiều | PostgreSQL (tốt nhưng MySQL phổ biến hơn ở VN) |

---

## 2. Phân Tích NotebookLM - User Flow

### 2.1 Core User Flows

```
[User Flow 1: Authentication]
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Login   │───▶│  Verify  │───▶│Dashboard │
│  Page    │    │   JWT    │    │  Page    │
└──────────┘    └──────────┘    └──────────┘

[User Flow 2: Create Notebook & Add Sources]
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Create  │───▶│  Notebook│───▶│  Upload  │───▶│  Parse   │
│ Notebook │    │  Detail  │    │   PDF    │    │  & Chunk │
└──────────┘    └──────────┘    └──────────┘    └──────────┘

[User Flow 3: Chat with Sources (RAG)]
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Ask     │───▶│ Retrieve │───▶│  Build   │───▶│  Show    │
│ Question │    │  Chunks  │    │ Response │    │ Citations│
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### 2.2 RAG Pipeline Chi Tiết

```
[Indexing Phase - Khi Upload Source]
PDF ──▶ Extract Text ──▶ Split Chunks ──▶ Generate Embeddings ──▶ Store in DB
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │ Chunk Table     │
                                    │ - content       │
                                    │ - embedding     │
                                    │ - source_id     │
                                    │ - position      │
                                    └─────────────────┘

[Query Phase - Khi User Hỏi]
Question ──▶ Embed Question ──▶ Similarity Search ──▶ Top-K Chunks
                                                           │
                                                           ▼
                                              ┌─────────────────┐
                                              │ Build Prompt    │
                                              │ with Context    │
                                              └────────┬────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │ LLM generates   │
                                              │ answer + refs   │
                                              └────────┬────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │ Parse citations │
                                              │ Return to UI    │
                                              └─────────────────┘
```

---

## 3. Database Schema

### 3.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│     users       │       │   notebooks     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │───1:N─│ id (PK)         │
│ email (UNIQUE)  │       │ user_id (FK)    │──┐
│ password_hash   │       │ title           │  │
│ created_at      │       │ created_at      │  │
│ updated_at      │       │ updated_at      │  │
└─────────────────┘       └─────────────────┘  │
                                               │
        ┌──────────────────────────────────────┘
        │
        │  1:N
        ▼
┌─────────────────┐       ┌─────────────────┐
│    sources      │       │     chunks      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │───1:N─│ id (PK)         │
│ notebook_id(FK) │       │ source_id (FK)  │
│ type (PDF/URL)  │       │ content (TEXT)  │
│ original_name   │       │ embedding (BLOB)│
│ file_path       │       │ position (INT)  │
│ url             │       │ metadata (JSON) │
│ status          │       │ created_at      │
│ created_at      │       └─────────────────┘
└─────────────────┘
        │
        │  (referenced by)
        ▼
┌─────────────────┐       ┌─────────────────┐
│     notes       │       │  chat_messages  │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ notebook_id(FK) │       │ notebook_id(FK) │
│ content (TEXT)  │       │ role (user/ai)  │
│ citation_refs   │       │ content (TEXT)  │
│ created_at      │       │ citations (JSON)│
│ updated_at      │       │ created_at      │
└─────────────────┘       └─────────────────┘
```

### 3.2 SQL Schema Chi Tiết

```sql
-- Migration V1: users
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email)
);

-- Migration V2: notebooks
CREATE TABLE notebooks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notebooks_user (user_id)
);

-- Migration V3: sources
CREATE TABLE sources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notebook_id BIGINT NOT NULL,
    type ENUM('PDF', 'URL') NOT NULL,
    original_name VARCHAR(255),
    file_path VARCHAR(512),
    url VARCHAR(2048),
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE,
    INDEX idx_sources_notebook (notebook_id),
    INDEX idx_sources_status (status)
);

-- Migration V4: chunks
CREATE TABLE chunks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    embedding BLOB,  -- Lưu vector embedding (serialize to bytes)
    position INT NOT NULL,
    start_page INT,
    end_page INT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
    INDEX idx_chunks_source (source_id),
    INDEX idx_chunks_position (source_id, position)
);

-- Migration V5: notes
CREATE TABLE notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notebook_id BIGINT NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    citation_refs JSON,  -- Array of {chunkId, text}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE,
    INDEX idx_notes_notebook (notebook_id)
);

-- Migration V6: chat_messages
CREATE TABLE chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notebook_id BIGINT NOT NULL,
    role ENUM('USER', 'ASSISTANT') NOT NULL,
    content TEXT NOT NULL,
    citations JSON,  -- Array of {chunkId, sourceId, text, relevance}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE,
    INDEX idx_chat_notebook_time (notebook_id, created_at)
);

-- Migration V7: refresh_tokens (cho JWT refresh)
CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(512) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_refresh_token (token),
    INDEX idx_refresh_user (user_id)
);
```

### 3.3 Giải Thích Citations Storage

```json
// Trong chat_messages.citations
[
  {
    "chunkId": 42,
    "sourceId": 5,
    "sourceName": "machine_learning.pdf",
    "text": "Neural networks consist of layers...",
    "page": 15,
    "relevance": 0.89
  },
  {
    "chunkId": 67,
    "sourceId": 5,
    "sourceName": "machine_learning.pdf", 
    "text": "Backpropagation is the key algorithm...",
    "page": 23,
    "relevance": 0.85
  }
]
```

**Frontend hiển thị citations:**
- Inline reference: "Neural networks [1] use backpropagation [2]..."
- Hover tooltip: Hiện full text của citation
- Click: Scroll đến source/page tương ứng

---

## 4. API Endpoints

### 4.1 Authentication APIs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Đăng ký user mới | No |
| POST | `/api/auth/login` | Đăng nhập, trả JWT | No |
| POST | `/api/auth/refresh` | Refresh access token | Refresh Token |
| POST | `/api/auth/logout` | Invalidate refresh token | Yes |

**Register Request/Response:**
```json
// POST /api/auth/register
// Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
// Response 201:
{
  "id": 1,
  "email": "user@example.com",
  "createdAt": "2024-01-15T10:30:00Z"
}
// Response 400:
{
  "error": "VALIDATION_ERROR",
  "message": "Email already exists"
}
```

**Login Request/Response:**
```json
// POST /api/auth/login
// Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
// Response 200:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJl...",
  "expiresIn": 900,
  "tokenType": "Bearer"
}
// Response 401:
{
  "error": "INVALID_CREDENTIALS",
  "message": "Email or password is incorrect"
}
```

### 4.2 Notebook APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notebooks` | List all notebooks của user |
| POST | `/api/notebooks` | Tạo notebook mới |
| GET | `/api/notebooks/{id}` | Lấy chi tiết notebook |
| PUT | `/api/notebooks/{id}` | Cập nhật notebook |
| DELETE | `/api/notebooks/{id}` | Xóa notebook |

**Create Notebook:**
```json
// POST /api/notebooks
// Request:
{
  "title": "Machine Learning Study",
  "description": "Notes for ML course"
}
// Response 201:
{
  "id": 1,
  "title": "Machine Learning Study",
  "description": "Notes for ML course",
  "sourcesCount": 0,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 4.3 Sources APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notebooks/{id}/sources` | List sources trong notebook |
| POST | `/api/notebooks/{id}/sources/upload` | Upload file PDF |
| POST | `/api/notebooks/{id}/sources/url` | Thêm URL source |
| GET | `/api/sources/{id}` | Lấy chi tiết source |
| DELETE | `/api/sources/{id}` | Xóa source |
| GET | `/api/sources/{id}/status` | Check processing status |

**Upload PDF:**
```json
// POST /api/notebooks/{id}/sources/upload
// Content-Type: multipart/form-data
// file: [PDF binary]

// Response 202 (Accepted - processing async):
{
  "id": 5,
  "originalName": "machine_learning.pdf",
  "type": "PDF",
  "status": "PROCESSING",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 4.4 Chat APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notebooks/{id}/chat` | Gửi message, nhận response |
| GET | `/api/notebooks/{id}/chat/history` | Lấy lịch sử chat |

**Chat Request/Response:**
```json
// POST /api/notebooks/{id}/chat
// Request:
{
  "message": "What is backpropagation?"
}
// Response 200:
{
  "id": 123,
  "role": "ASSISTANT",
  "content": "Backpropagation is an algorithm... [1][2]",
  "citations": [
    {
      "id": 1,
      "chunkId": 42,
      "sourceId": 5,
      "sourceName": "ml_book.pdf",
      "text": "Backpropagation computes gradients...",
      "page": 45,
      "relevance": 0.92
    }
  ],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 4.5 Notes APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notebooks/{id}/notes` | List notes trong notebook |
| POST | `/api/notebooks/{id}/notes` | Tạo note mới |
| PUT | `/api/notes/{id}` | Cập nhật note |
| DELETE | `/api/notes/{id}` | Xóa note |

### 4.6 HTTP Status Codes Convention

| Code | Usage |
|------|-------|
| 200 | Success GET/PUT |
| 201 | Created (POST success) |
| 202 | Accepted (async processing started) |
| 204 | No Content (DELETE success) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (không có quyền) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Internal Server Error |

---

## 5. Roadmap - 8 Milestones (10-12 Tuần)

### Milestone 1: Project Setup & Authentication (Tuần 1-2)

**Mục tiêu:** Setup project structure và hoàn thành flow đăng ký/đăng nhập

**Kiến thức cần học:**
- React project với Vite + TypeScript
- Spring Boot project với Maven
- Spring Security + JWT
- MySQL cơ bản + Flyway migration

**Tasks:**
1. [ ] Init React project với Vite + TypeScript + TailwindCSS
2. [ ] Init Spring Boot project với dependencies
3. [ ] Setup MySQL local + Flyway
4. [ ] Tạo migration V1 (users table)
5. [ ] Implement UserEntity + Repository
6. [ ] Implement AuthController + AuthService
7. [ ] Configure Spring Security + JWT filter
8. [ ] Frontend: Login page UI
9. [ ] Frontend: Register page UI
10. [ ] Frontend: Auth context + protected routes
11. [ ] Test E2E: Register → Login → Access protected route

**Deliverables:**
- [ ] Backend chạy được ở localhost:8080
- [ ] Frontend chạy được ở localhost:5173
- [ ] Có thể register user mới
- [ ] Có thể login và nhận JWT
- [ ] Protected routes cần JWT để access

**Test Cases:**
- Register với email hợp lệ → Success
- Register với email đã tồn tại → 409 Conflict
- Login với credentials đúng → Nhận JWT
- Login với password sai → 401 Unauthorized
- Access protected route không có token → 401
- Access protected route với token expired → 401
- Refresh token thành công → Nhận access token mới

**Lỗi thường gặp:**
- CORS error khi gọi từ React → Cần configure CORS trong Spring
- JWT không verify được → Kiểm tra secret key, algorithm
- BCrypt mismatch → Đảm bảo dùng BCrypt cả 2 nơi

---

### Milestone 2: Notebook Module (Tuần 3)

**Mục tiêu:** CRUD notebooks với phân quyền

**Kiến thức cần học:**
- Spring Data JPA relationships
- REST API design best practices
- React state management (Context hoặc Zustand)
- Optimistic updates

**Tasks:**
1. [ ] Migration V2: notebooks table
2. [ ] NotebookEntity + Repository
3. [ ] NotebookController (CRUD)
4. [ ] Authorization: Chỉ owner mới access được notebook
5. [ ] Frontend: Notebooks list page
6. [ ] Frontend: Create notebook modal
7. [ ] Frontend: Notebook detail page (shell)
8. [ ] Frontend: Edit/Delete notebook

**Deliverables:**
- [ ] User có thể tạo/sửa/xóa notebook của mình
- [ ] User không thể access notebook của người khác
- [ ] UI hiển thị danh sách notebooks

**Test Cases:**
- Create notebook → Xuất hiện trong list
- Update title → Title mới hiển thị
- Delete notebook → Biến mất khỏi list
- Access notebook của user khác → 403 Forbidden
- List notebooks → Chỉ show notebooks của mình

**Lỗi thường gặp:**
- N+1 query problem → Dùng @EntityGraph hoặc JOIN FETCH
- Quên check ownership → Security vulnerability

---

### Milestone 3: Sources Module - Upload & Storage (Tuần 4-5)

**Mục tiêu:** Upload PDF, lưu file, tracking status

**Kiến thức cần học:**
- Multipart file upload trong Spring
- File storage strategy (local → cloud later)
- Async processing với @Async
- React dropzone/file upload

**Tasks:**
1. [ ] Migration V3: sources table
2. [ ] SourceEntity + Repository
3. [ ] File storage service (local storage first)
4. [ ] Upload endpoint (multipart)
5. [ ] URL source endpoint
6. [ ] Processing status endpoint
7. [ ] Frontend: Source upload UI (drag & drop)
8. [ ] Frontend: Sources list trong notebook
9. [ ] Frontend: Upload progress indicator
10. [ ] Frontend: Processing status polling

**Deliverables:**
- [ ] Upload PDF file thành công
- [ ] File được lưu trên server
- [ ] Source record được tạo trong DB
- [ ] UI hiển thị danh sách sources
- [ ] Có thể thêm URL source

**Test Cases:**
- Upload PDF < 10MB → Success
- Upload PDF > size limit → 400 Bad Request
- Upload non-PDF file → 400 Bad Request
- Add valid URL → Success
- Add invalid URL → 400 Bad Request
- Delete source → File xóa khỏi storage

**Lỗi thường gặp:**
- File quá lớn không handle được → Cần config max file size
- File path injection → Validate filename
- Memory out khi upload lớn → Dùng streaming

---

### Milestone 4: Text Extraction & Chunking (Tuần 5-6)

**Mục tiêu:** Parse PDF thành text, chia chunks

**Kiến thức cần học:**
- Apache PDFBox library
- Text chunking strategies
- Async processing patterns
- Error handling & retry

**Tasks:**
1. [ ] Migration V4: chunks table
2. [ ] ChunkEntity + Repository
3. [ ] PDFExtractorService (dùng PDFBox)
4. [ ] TextChunkingService (split by paragraphs/tokens)
5. [ ] Async processing flow
6. [ ] Error handling + retry logic
7. [ ] Frontend: Show extraction status
8. [ ] Frontend: Preview extracted chunks

**Deliverables:**
- [ ] PDF được parse thành text
- [ ] Text được chia thành chunks (~500 tokens mỗi chunk)
- [ ] Chunks được lưu vào DB với position
- [ ] Status update từ PROCESSING → COMPLETED/FAILED

**Chunking Strategy:**
```
Option 1: Fixed size (simple)
- Chia 500 tokens, overlap 50 tokens
- Pros: Predictable size
- Cons: Có thể cắt giữa câu

Option 2: Semantic (recommended)
- Chia theo paragraph/section
- Ensure không vượt quá 1000 tokens
- Pros: Context coherent
- Cons: Size không đều
```

**Test Cases:**
- Parse PDF 1 page → Chunks tạo thành công
- Parse PDF 100 pages → Performance OK (< 30s)
- Parse corrupted PDF → Status = FAILED, error message
- Parse PDF scan (image-based) → Cảnh báo hoặc skip

**Lỗi thường gặp:**
- PDF encrypted → Cần password hoặc skip
- PDF scan không có text → Cần OCR (phức tạp)
- OutOfMemory với PDF lớn → Stream processing

---

### Milestone 5: RAG Pipeline & Chat (Tuần 7-8)

**Mục tiêu:** Implement semantic search + LLM chat

**Kiến thức cần học:**
- Embeddings (OpenAI/Google)
- Vector similarity search
- Prompt engineering
- Streaming responses (optional)

**Tasks:**
1. [ ] Migration V5-V6: notes, chat_messages tables
2. [ ] EmbeddingService (call OpenAI/Gemini API)
3. [ ] Generate embeddings for chunks
4. [ ] VectorSearchService (cosine similarity)
5. [ ] PromptBuilder (context + question)
6. [ ] LLMService (call OpenAI/Gemini)
7. [ ] CitationParser (extract refs from response)
8. [ ] ChatController + ChatService
9. [ ] Frontend: Chat UI
10. [ ] Frontend: Citations display with highlights
11. [ ] Frontend: Source reference hover/click

**Deliverables:**
- [ ] User hỏi → Backend retrieve relevant chunks
- [ ] LLM trả lời dựa trên context
- [ ] Response có citations
- [ ] UI hiển thị citations có thể click

**RAG Flow Pseudo-code:**
```
function chat(notebookId, question):
    // 1. Embed question
    questionVector = embeddingService.embed(question)
    
    // 2. Get all chunks of notebook
    chunks = chunkRepository.findByNotebookId(notebookId)
    
    // 3. Calculate similarity
    rankedChunks = chunks.map(chunk => {
        similarity: cosineSimilarity(questionVector, chunk.embedding),
        chunk: chunk
    }).sortByDescending(similarity)
    
    // 4. Take top K
    topChunks = rankedChunks.take(5)
    
    // 5. Build prompt
    context = topChunks.map(c => c.content).join("\n---\n")
    prompt = """
    Answer based ONLY on the following context. 
    Cite sources using [1], [2], etc.
    If cannot answer from context, say "I don't know".
    
    Context:
    ${context}
    
    Question: ${question}
    """
    
    // 6. Call LLM
    response = llmService.generate(prompt)
    
    // 7. Parse citations
    citations = parseCitations(response, topChunks)
    
    return { response, citations }
```

**Tránh Hallucination:**
- Prompt rõ ràng: "ONLY answer from context"
- Include "I don't know" option
- Verify citations exist in context
- Show confidence score

**Test Cases:**
- Hỏi câu có trong sources → Trả lời đúng + citation
- Hỏi câu không liên quan → "I don't know"
- Hỏi về multiple sources → Citations từ nhiều nguồn
- Empty notebook → Thông báo không có sources

**Lỗi thường gặp:**
- LLM hallucinate → Improve prompt, lower temperature
- Wrong citation mapping → Double-check parsing logic
- Rate limit exceeded → Implement retry + backoff

---

### Milestone 6: Notes Module (Tuần 9)

**Mục tiêu:** CRUD notes với citation linking

**Kiến thức cần học:**
- Rich text editor (optional)
- JSON field handling
- UX pattern for linking

**Tasks:**
1. [ ] NoteEntity + Repository
2. [ ] NoteController (CRUD)
3. [ ] Link note to citations
4. [ ] Frontend: Notes list trong notebook
5. [ ] Frontend: Create/Edit note
6. [ ] Frontend: Add citation to note
7. [ ] Frontend: View linked citations

**Deliverables:**
- [ ] Tạo/sửa/xóa notes
- [ ] Link note với citation từ chat
- [ ] View citations inline trong note

---

### Milestone 7: Deployment (Tuần 10)

**Mục tiêu:** Deploy full stack lên production

**Kiến thức cần học:**
- Vercel deployment
- Docker basics
- Cloud MySQL (PlanetScale/Railway)
- Environment variables
- HTTPS/CORS production

**Tasks:**
1. [ ] Dockerize backend
2. [ ] Setup MySQL on cloud
3. [ ] Deploy backend to Railway/Render
4. [ ] Configure environment variables
5. [ ] Deploy frontend to Vercel
6. [ ] Setup domain (optional)
7. [ ] Configure production CORS
8. [ ] Setup CI/CD (optional)

**Deployment Architecture:**
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Vercel      │────▶│ Railway/Render  │────▶│ PlanetScale     │
│  (Frontend)     │     │   (Backend)     │     │   (MySQL)       │
│  React SPA      │     │  Spring Boot    │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Checklist Deploy:**
- [ ] Backend health endpoint
- [ ] Database connection verified
- [ ] CORS configured for frontend domain
- [ ] JWT secret từ env var
- [ ] LLM API key từ env var
- [ ] File storage configured (cloud)

---

### Milestone 8: Phase 2 Features (Tuần 11-12+)

**Optional tasks theo priority:**
1. [ ] Search within sources
2. [ ] Auto summarize source
3. [ ] Export notes to PDF
4. [ ] Study guide generation
5. [ ] Flashcard generator
6. [ ] Timeline view

---

## 6. Hướng Dẫn Deploy Chi Tiết

### 6.1 Frontend → Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy (trong folder frontend)
cd frontend
vercel

# 4. Set environment variables trong Vercel dashboard
# VITE_API_URL=https://your-backend.railway.app
```

### 6.2 Backend → Railway

```bash
# 1. Tạo Dockerfile
# Dockerfile
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

# 2. Build
mvn clean package -DskipTests

# 3. Tạo project trên railway.app
# Connect GitHub repo
# Add environment variables:
# - SPRING_DATASOURCE_URL
# - SPRING_DATASOURCE_USERNAME
# - SPRING_DATASOURCE_PASSWORD
# - JWT_SECRET
# - OPENAI_API_KEY
```

### 6.3 MySQL → PlanetScale

```bash
# 1. Tạo database trên planetscale.com
# 2. Get connection string
# 3. Add to Railway env vars:
# SPRING_DATASOURCE_URL=jdbc:mysql://aws.connect.psdb.cloud/your-db?sslMode=REQUIRE
```

### 6.4 CORS Configuration

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins(
                        "http://localhost:5173",  // Dev
                        "https://your-app.vercel.app"  // Prod
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

---

## 7. Kiến Thức Cần Học Để Đi Làm

### 7.1 Frontend (React + TypeScript)

| Topic | Priority | Resources |
|-------|----------|-----------|
| React Hooks (useState, useEffect, useContext) | HIGH | React docs |
| TypeScript basics (types, interfaces, generics) | HIGH | typescript-handbook |
| React Router v6 | HIGH | reactrouter.com |
| API calls với fetch/axios | HIGH | - |
| Form handling | MEDIUM | react-hook-form |
| State management | MEDIUM | Context API first |
| Component patterns | MEDIUM | Kent C. Dodds blog |

### 7.2 Backend (Spring Boot)

| Topic | Priority | Resources |
|-------|----------|-----------|
| Spring Core (DI, IoC) | HIGH | Spring docs |
| Spring Data JPA | HIGH | Baeldung |
| Spring Security | HIGH | Baeldung security |
| REST API design | HIGH | RESTful Web APIs |
| Exception handling | HIGH | @ControllerAdvice |
| Validation | MEDIUM | @Valid, Bean Validation |
| Testing (JUnit, Mockito) | MEDIUM | - |

### 7.3 Database

| Topic | Priority | Resources |
|-------|----------|-----------|
| SQL basics (CRUD, JOIN) | HIGH | Mode SQL Tutorial |
| Indexing | HIGH | Use The Index, Luke |
| Database design | MEDIUM | Database normalization |
| Transactions | MEDIUM | ACID properties |
| Flyway migrations | MEDIUM | Flyway docs |

### 7.4 DevOps Basics

| Topic | Priority | Resources |
|-------|----------|-----------|
| Git workflow | HIGH | git-flow |
| Docker basics | MEDIUM | Docker docs |
| Environment variables | MEDIUM | 12-factor app |
| CI/CD concepts | LOW | GitHub Actions |

---

## 8. Lỗi Thường Gặp & Cách Debug

### 8.1 Frontend Common Issues

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| CORS error | Backend chưa config CORS | Add CORS config |
| 401 liên tục | Token expired/invalid | Check token refresh logic |
| State không update | Missing dependency in useEffect | Add deps to array |
| Type errors | Mismatched types | Define proper interfaces |
| Blank page sau deploy | Wrong base URL | Check Vite config |

### 8.2 Backend Common Issues

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| 403 Forbidden | Security filter block | Check SecurityConfig |
| LazyInitializationException | Lazy load ngoài transaction | Use JOIN FETCH or DTO |
| Circular dependency | Bean depend nhau | Use @Lazy or restructure |
| DB connection fail | Wrong credentials | Check application.yml |
| Migration fail | SQL syntax error | Check Flyway scripts |

### 8.3 Debugging Tips

```bash
# Backend: Enable debug logging
logging.level.org.springframework.security=DEBUG
logging.level.org.hibernate.SQL=DEBUG

# Frontend: React DevTools + Network tab

# API: Test với Postman trước khi integrate

# Database: MySQL Workbench để check data
```

---

## 9. Git Workflow & Commit Convention

### Branch Strategy
```
main ────────────────────────────────────────────▶
  │
  └─── develop ──────────────────────────────────▶
         │        │        │        │
         └─ feature/auth   │        │
                   └─ feature/notebooks
                            └─ feature/sources
```

### Commit Message Format
```
<type>(<scope>): <subject>

# Examples:
feat(auth): add JWT refresh token endpoint
fix(upload): handle large file timeout
docs(readme): add API documentation
refactor(chat): extract embedding logic to service
test(notebook): add CRUD integration tests
```

**Types:** feat, fix, docs, style, refactor, test, chore

---

## 10. Timeline Summary

| Tuần | Milestone | Focus |
|------|-----------|-------|
| 1-2 | Setup & Auth | Project structure, Login/Register |
| 3 | Notebooks | CRUD notebooks |
| 4-5 | Sources | File upload, storage |
| 5-6 | Parsing | PDF extraction, chunking |
| 7-8 | RAG & Chat | Embeddings, LLM integration |
| 9 | Notes | Notes with citations |
| 10 | Deploy | Production deployment |
| 11-12 | Phase 2 | Optional enhancements |

---

## Bước Tiếp Theo

1. **Bạn review plan này** và cho feedback
2. Sau khi approved → Bắt đầu Milestone 1
3. Mỗi milestone tôi sẽ hướng dẫn chi tiết từng task

> **Reminder:** Tôi sẽ guide bạn từng bước, đưa skeleton code minh họa, nhưng BẠN phải tự code và debug. Đây là cách học hiệu quả nhất!

Bạn có câu hỏi gì về roadmap này không?
