<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Cybersecurity Training App

This project is a Vite + React training app that can be run locally during development and published as a static website.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Start the development server:
   `npm.cmd run dev`
3. Open the local Vite URL, usually:
   `http://localhost:3000`

## Build For Publishing

1. Create a production build:
   `npm.cmd run build`
2. The publish-ready files will be generated in:
   `dist/`

## Publish As A Website

This app can be hosted as a static site. No Node server, database, or API secret is required for the current version.

- Internal company hosting: upload the contents of `dist/` to your intranet, IIS, Nginx, or other internal web server.
- Netlify or Vercel: upload the `dist/` folder and restrict access if needed.
- Azure Static Web Apps: deploy the built site if your organization prefers Azure.

## Important Notes

- Do not publish the temporary dev-server link from `npm run dev`; that link only works while your local machine is running the app.
- This project has no current AI or API-key dependency in its static deployment flow.
