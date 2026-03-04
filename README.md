# Cinematographer Portfolio

A professional portfolio website for Cinematographer Koo Sung-min.

## Features

- **Dynamic Content**: Manage all text and projects via the Admin panel.
- **Project Management**: Add, edit, and delete projects with multiple video links and images.
- **Equipment List**: Categorized equipment management.
- **Responsive Design**: Optimized for all devices with a minimalist, high-end aesthetic.
- **Admin Panel**: Secure management of site content.

## Admin Access

- **URL**: `/admin`
- **Password**: `0901`

## Tech Stack

- **Frontend**: React, Tailwind CSS, Lucide React, Framer Motion.
- **Backend**: Node.js, Express.
- **Database**: SQLite (better-sqlite3).
- **Build Tool**: Vite.

## Deployment Notes

- The app is configured for full-stack execution in the AI Studio environment.
- For deployment to Netlify, use the provided `netlify.toml` and functions. Note that the SQLite database requires a persistent backend; the Netlify functions currently act as a proxy to the main server.
