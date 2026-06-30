# BioLearn

An interactive biology learning platform designed for high school students (SMA) and college preparation. Explore biology topics through rich content, quizzes, animations, and progress tracking — available in both Indonesian and English.

## About

BioLearn makes biology fun and accessible. The platform covers 8 major biology chapters across three grade levels (X, XI, XII), featuring interactive visualizations, drag-and-drop activities, hotspot diagrams, and comprehensive quizzes with instant feedback.

## Features

- **Landing Page** — Animated hero section with biology-themed visuals powered by Framer Motion
- **8 Complete Chapters** — Cell Biology, Digestive System, Ecosystem, Genetics, Evolution, Circulatory System, Nervous System, and Bacteria
- **Interactive Quizzes** — Multiple-choice questions for every sub-chapter with explanations and score tracking
- **Visual Animations** — DNA double helix, digestive system flow, and interactive hotspot diagrams for cell and organ structures
- **Progress Tracking** — Mastery score, quiz statistics, and per-chapter progress stored in SQLite database
- **Bilingual Support** — Full Indonesian and English language toggle
- **Glossary** — Biology terminology dictionary with definitions in both languages
- **User Authentication** — Register and login system with per-user progress isolation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| State Management | Zustand |
| Database | SQLite (better-sqlite3) |
| Animations | Framer Motion |
| Icons | Lucide React |

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated routes (with sidebar)
│   │   ├── bab/[slug]/     # Chapter detail pages
│   │   ├── dashboard/      # Dashboard
│   │   ├── glossary/       # Glossary page
│   │   ├── login/          # Login page
│   │   └── progress/       # Progress tracking page
│   ├── api/                # API routes
│   │   ├── auth/           # Login & register endpoints
│   │   └── progress/       # Progress CRUD endpoints
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/
│   ├── auth/               # Login & auth guard
│   ├── layout/             # Header, Sidebar, AppLayout
│   ├── sections/           # Page components (dashboard, bab-view, etc.)
│   └── ui/                 # Shared UI components
└── lib/
    ├── bab-data.ts         # Chapter & subject data
    ├── quiz-data.ts        # Quiz questions
    ├── glossary-data.ts    # Glossary terms
    ├── i18n.ts             # Translations (ID & EN)
    ├── db.ts               # SQLite database setup & queries
    ├── auth-store.ts       # Authentication state
    ├── progress-store.ts   # Progress state
    └── lang-store.ts       # Language toggle state
```

## Database Schema

**users**
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | UUID primary key |
| email | TEXT | Unique email address |
| password | TEXT | SHA-256 hashed password |
| name | TEXT | Display name |
| role | TEXT | "user" or "admin" |

**progress**
| Column | Type | Description |
|--------|------|-------------|
| user_id | TEXT | Foreign key to users |
| bab_id | TEXT | Chapter identifier |
| quizzes | INTEGER | Number of quizzes taken |
| correct | INTEGER | Number of correct answers |
| total | INTEGER | Total questions answered |
| subs | TEXT | JSON of sub-chapter completion status |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Authenticate user |
| POST | `/api/auth/register` | Create new account |
| GET | `/api/progress?email=` | Fetch user progress |
| POST | `/api/progress` | Save quiz answer |

## Biology Chapters

| Chapter | Grade | Topics |
|---------|-------|--------|
| Bacteria | X | Prokaryotic cells, structure, reproduction, classification |
| Cell Biology | XI | Cell theory, organelles, membrane transport, cell division |
| Digestive System | XI | Organs, enzymes, digestion mechanism, absorption & disorders |
| Circulatory System | XI | Heart & blood vessels, blood components, circulation, disorders |
| Nervous System | XI | Neurons, CNS, PNS, sensory organs |
| Genetics | XII | DNA & RNA, protein synthesis, Mendelian genetics, mutations |
| Evolution | XII | Theory, natural selection, speciation, evidence |
| Ecology | XII | Ecosystem components, energy flow, biogeochemical cycles, biodiversity |

## License

This project is for educational purposes.
