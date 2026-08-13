# Technology Stack

**Analysis Date:** 2026-08-14

## Languages

**Primary:**
- JavaScript (ES Modules / JSX) - Backend (Node.js/Express) and Frontend (React 19 / Vite)
- HTML5 / CSS3 - Core layout, Tailwind CSS utility styling

**Secondary:**
- TypeScript (Configured via `typescript` devDependency in frontend, with partial skeleton files)

## Runtime

**Environment:**
- Node.js (v18+ / v20+ recommended)
- Browser environment supporting modern ES6+

**Package Manager:**
- `npm` (active lockfiles and package manifests in `backend/` and `frontend/`)

## Frameworks & Core Libraries

**Backend (`backend/package.json`):**
- Express 5.1.0 (`express`) - Web application framework
- Helmet 8.1.0 (`helmet`) - Security HTTP header middleware
- CORS 2.8.5 (`cors`) - Cross-Origin Resource Sharing middleware
- Express Rate Limit 7.5.0 (`express-rate-limit`) - In-memory IP rate limiting
- Express Validator 7.2.1 (`express-validator`) - Request body and query validation pipelines
- Dotenv 16.5.0 (`dotenv`) - Environment variable loading
- Nodemon 3.1.0 (`nodemon` devDep) - Local development file watching and reload

**Frontend (`frontend/package.json`):**
- React 19.x & React DOM 19.x - UI component library
- Vite 8.2.0 (`vite`, `@vitejs/plugin-react`) - Build tool and development server
- React Router DOM 7.18.2 (`react-router-dom`) - Client-side routing and navigation
- Redux Toolkit 2.12.0 (`@reduxjs/toolkit`) & React Redux 9.3.0 (`react-redux`) - Global state management
- Tailwind CSS 4.3.3 (`tailwindcss`, `@tailwindcss/vite`) - Modern utility-first CSS engine
- Framer Motion 13.0.0 (`framer-motion`) - Smooth animations and interactive transitions
- React Hook Form 7.85.0 (`react-hook-form`) - Form state and validation handling
- React Icons 5.7.0 (`react-icons`) - Icon library
- Axios 1.19.0 (`axios`) - HTTP client with request/response interceptors

## Data & Cloud Platform

**Backend & Frontend Cloud Integration:**
- `@supabase/supabase-js` 2.112.2:
  - Supabase PostgreSQL Database
  - Supabase Auth (JWT bearer verification & client sessions)
  - Supabase Storage (product image media uploads)

## Build & Tooling

**Build Scripts:**
- Backend:
  - `npm run dev`: `nodemon src/server.js`
  - `npm start`: `node src/server.js`
- Frontend:
  - `npm run dev`: `vite`
  - `npm run build`: `tsc && vite build`
  - `npm run preview`: `vite preview`
