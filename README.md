# CodeGen Component Creator

This project is a React application for creating components with AI assistance. It has been migrated from Create React App to Vite for better performance and development experience.

## Environment Setup

Before running the application, you need to set up your environment variables:

1. Create a Supabase project at [https://supabase.io/](https://supabase.io/) if you haven't already
2. Get your Supabase URL and anon key from your Supabase project dashboard
3. Copy the `.env.example` file to `.env`
4. Replace the placeholder values with your actual credentials

```bash
cp .env.example .env
```

### Supabase Setup

1. Go to [https://supabase.io/](https://supabase.io/) and create a free account
2. Create a new project
3. In your project dashboard, find your project URL and anon key in the API settings
4. Update the `.env` file with these values

### Mem0 Setup (Optional)

1. Go to [https://mem0.ai/](https://mem0.ai/) and create an account
2. Get your API key from the dashboard
3. Update the `VITE_MEM0_API_KEY` in your `.env` file with your actual API key

## Available Scripts

In the project directory, you can run:

### `npm run dev` or `npm start`

Runs the app in development mode using Vite.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.

### `npm run build`

Builds the app for production to the `dist` folder.

### `npm run preview`

Preview the production build locally.

## Learn More

This project uses:
- [Vite](https://vitejs.dev/) as the build tool
- [React](https://reactjs.org/) for the UI
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Supabase](https://supabase.io/) for authentication
- [Mem0](https://mem0.ai/) for memory management

For more information on React, check out the [React documentation](https://reactjs.org/).
