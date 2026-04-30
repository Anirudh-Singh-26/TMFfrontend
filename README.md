# TaskFlow Frontend

## Overview
This is the frontend of TaskFlow, a MERN-based Team Task Manager application.

## Features
- User Authentication (Login / Signup)
- Role-based UI (Admin / Member)
- Dashboard with task stats
- Project listing with pagination (Show More / Less)
- Task creation, assignment, and status tracking
- Deadline and priority management

## Tech Stack
- React (Vite)
- Context API (Auth)
- CSS (Custom Design System)

## Setup
npm install
npm run dev

## Environment Variables
Create a .env file:

VITE_API_URL=https://your-backend-url

## Deployment
- Build: npm run build
- Deploy on Railway / Vercel / Netlify

## Notes
- Uses HttpOnly cookies for authentication
- Ensure backend CORS is configured correctly
