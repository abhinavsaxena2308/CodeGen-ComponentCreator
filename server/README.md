# CodeGen Backend Server

This is the backend server for the CodeGen component creator application. It provides AI-powered code generation using Google's Gemini API.

## Prerequisites

1. Node.js (v14 or higher)
2. A Google Gemini API key (get it from [Google AI Studio](https://aistudio.google.com/app/apikey))

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your Gemini API key:
   ```bash
   cp .env.example .env
   # Edit .env and add your API key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Or start the production server:
   ```bash
   npm start
   ```

## Deployment Options

### Deploy to Render (Recommended)

1. Fork this repository to your GitHub account
2. Go to [Render](https://render.com/) and create an account
3. Click "New Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - Name: `codegen-backend`
   - Environment: `Node`
   - Build command: `npm install`
   - Start command: `npm start`
   - Plan: `Free`
6. Add environment variables:
   - `GEMINI_API_KEY`: Your actual Gemini API key
7. Click "Create Web Service"

### Deploy to Heroku

1. Install the Heroku CLI
2. Login to Heroku:
   ```bash
   heroku login
   ```
3. Create a new app:
   ```bash
   heroku create your-app-name
   ```
4. Set environment variables:
   ```bash
   heroku config:set GEMINI_API_KEY=your-actual-api-key
   ```
5. Deploy:
   ```bash
   git push heroku main
   ```

### Deploy to Railway

1. Go to [Railway](https://railway.app/) and create an account
2. Create a new project
3. Connect your GitHub repository
4. Add environment variables:
   - `GEMINI_API_KEY`: Your actual Gemini API key
5. Deploy

## Environment Variables

- `GEMINI_API_KEY` (required): Your Google Gemini API key
- `PORT` (optional): Port to run the server on (default: 5000)

## API Endpoints

- `POST /generate` - Generate code based on a prompt
- `GET /preview/:id` - Get preview HTML for a generated component
- `GET /history` - Get generation history
- `GET /languages` - Get supported languages
- `GET /health` - Health check endpoint

## File Storage

The server stores generated components in the `data/` directory:
- `generated_history.json` - History of generated components
- `*.html` - Individual preview files

Note: In a production environment, you should use a persistent storage solution like a database or cloud storage.