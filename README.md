# CodeGen Component Creator

CodeGen is an AI-powered component generator that creates UI components based on natural language descriptions. Built with React, Vite, and Google's Gemini AI.

## Features

- AI-powered component generation using Google Gemini
- Support for multiple frameworks (React, Vue, HTML, CSS, etc.)
- Real-time preview of generated components
- Chat-based interface similar to ChatGPT
- Component history and management

## Prerequisites

1. Node.js (v14 or higher)
2. A Google Gemini API key (get it from [Google AI Studio](https://aistudio.google.com/app/apikey))

## Getting Started

### Frontend Setup

1. Install frontend dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Gemini API key:
   ```bash
   cp .env.example .env
   # Edit .env and add your API key
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

## Deployment

### Deploying the Backend

The backend can be deployed to several platforms. See [server/README.md](server/README.md) for detailed instructions.

#### Quick Deploy to Render (Recommended)

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

### Deploying the Frontend

The frontend can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.

#### Deploy to Vercel

1. Build the frontend:
   ```bash
   npm run build
   ```

2. The built files will be in the `dist/` directory
3. Deploy the `dist/` directory to Vercel

#### Deploy to Netlify

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` directory to Netlify

## Environment Variables

### Frontend (.env)
Create a `.env` file in the root directory:
```bash
VITE_API_URL=https://your-backend-url.com
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_MEM0_API_KEY=your-mem0-api-key
```

### Backend (.env)
Create a `.env` file in the `server/` directory:
```bash
GEMINI_API_KEY=your-gemini-api-key
PORT=5000
```

## Project Structure

- `src/` - Frontend React components
- `server/` - Backend Node.js/Express server
- `public/` - Static assets
- `dist/` - Built frontend files

## API Endpoints

- `POST /generate` - Generate code based on a prompt
- `GET /preview/:id` - Get preview HTML for a generated component
- `GET /history` - Get generation history
- `GET /languages` - Get supported languages
- `GET /health` - Health check endpoint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.