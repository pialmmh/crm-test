# AI Chatbot Application

A modern, responsive AI chatbot built with React, TypeScript, Tailwind CSS, and Express.js, integrated with OpenAI's API.

## Features

- 🎨 Beautiful, modern UI with gradient designs
- 💬 Real-time chat interface
- 🤖 OpenAI GPT-3.5 Turbo integration
- 📱 Fully responsive design
- ⚡ Fast and lightweight
- 🔒 Secure API key handling

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
1. Copy the example environment file:
   ```bash
   cp server/.env.example server/.env
   ```

2. Add your OpenAI API key to `server/.env`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3003
   ```

### 3. Run the Application

#### Development Mode
Run both frontend and backend:

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run dev:server
```

The frontend will be available at `http://localhost:5173`
The backend will be available at `http://localhost:3003`

### 4. Build for Production
```bash
npm run build
```

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── ChatHeader.tsx
│   │   ├── ChatContainer.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   └── LoadingIndicator.tsx
│   ├── hooks/
│   │   └── useChat.ts
│   ├── App.tsx
│   └── main.tsx
├── server/
│   ├── index.js
│   └── .env.example
└── package.json
```

## Technologies Used

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Express.js, Node.js
- **AI Integration:** OpenAI API
- **Icons:** Lucide React
- **Styling:** Tailwind CSS with custom gradients