# UI Designer App - Stitch AI Clone

A Next.js 14 application that replicates Google Stitch AI functionality, enabling users to generate UI designs through natural language prompts with AI assistance.

---

## 🚀 Features

### Core Features
- **AI-Powered UI Generation** - Generate UI components from text descriptions using Claude/OpenAI
- **Real-time Chat Interface** - Conversational AI interaction for design prompts
- **Live Preview Canvas** - Visual representation of generated UI code
- **Resizable Panels** - Adjustable split-view layout with drag-to-resize panels
- **Settings Management** - Secure API key storage with localStorage persistence

### UI/UX Features
- **Dark Mode Support** - Automatic theme switching via CSS variables
- **Responsive Layout** - Adapts to different screen sizes
- **Modern Design** - Clean interface with shadcn/ui components
- **Auto-expanding Input** - Smart textarea that grows with content

### Technical Features
- **BYOK (Bring Your Own Key)** - Use your own API keys securely
- **State Persistence** - Chat history and settings survive page reloads
- **TypeScript Support** - Full type safety throughout codebase

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui |
| **State Management** | Zustand |
| **Icons** | Lucide React |
| **Utilities** | clsx, tailwind-merge |

### Key Dependencies
```json
{
  "next": "14.2.35",
  "react": "^18",
  "shadcn": "^4.7.0",
  "zustand": "^5.0.13",
  "lucide-react": "^1.14.0",
  "tailwind-merge": "^3.6.0",
  "clsx": "^2.1.1"
}
```

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| **Total Files** | 25+ |
| **Components** | 15+ |
| **UI Components** | 8 (shadcn) |
| **Store Slices** | 1 (Zustand) |
| **Languages** | TypeScript (100%) |

---

## ⚙️ Configuration

### shadcn/ui Configuration (`components.json`)
```json
{
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide"
}
```

### Tailwind Configuration
- **Content paths**: `./app/**/*.{js,ts,jsx,tsx,mdx}`, `./components/**/*.{js,ts,jsx,tsx,mdx}`
- **Custom colors**: CSS variables (background, foreground)
- **Plugins**: None required

### Project Structure
```
├── app/
│   ├── page.tsx          # Main layout
│   ├── globals.css       # Global styles + CSS variables
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/              # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   ├── scroll-area.tsx
│   │   ├── skeleton.tsx
│   │   └── tooltip.tsx
│   ├── chat/            # Chat components
│   │   ├── ChatPanel.tsx
│   │   ├── ChatMessage.tsx
│   │   └── ChatInput.tsx
│   ├── navbar.tsx        # Top navigation
│   ├── resizable-panel.tsx  # Resizable split panel
│   └── settings-modal.tsx   # API key settings
├── lib/
│   └── utils.ts         # cn() utility
├── store/
│   └── useAppStore.ts   # Zustand store
└── store/
    └── useAppStore.ts   # Global state
```

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        UI[UI Components]
        Pages[App Pages]
    end

    subgraph State["State Management"]
        Store[Zustand Store]
        Persist[LocalStorage]
    end

    subgraph Components["Component Layer"]
        Nav[Navbar]
        Chat[Chat Components]
        Canvas[Canvas/Preview]
    end

    subgraph UI_lib["UI Library"]
        shadcn[shadcn/ui Components]
        Tailwind[Tailwind CSS]
    end

    UI --> Pages
    Pages --> Nav
    Pages --> Chat
    Pages --> Canvas
    
    Nav --> Store
    Chat --> Store
    Store --> Persist
    
    Chat --> shadcn
    Canvas --> shadcn
    
    shadcn --> Tailwind
end
```

```mermaid
flowchart LR
    subgraph User_Flow
        A[User Input] --> B[Chat Input]
        B --> C[Zustand Store]
        C --> D[AI API Call]
        D --> E[Generate Code]
        E --> F[Update Store]
        F --> G[Canvas Preview]
    end

    style A fill:#e1f5fe
    style G fill:#e8f5e9
    style D fill:#fff3e0
end
```

---

## 📋 Prerequisites

- **Node.js** 18.x or later
- **npm** or **yarn** or **pnpm**
- **Anthropic API Key** (Claude) OR **OpenAI API Key**

---

## 🚦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Browser
Navigate to: **http://localhost:3000**

### 4. Configure API Key
1. Click the **Settings** icon in the top-right corner
2. Enter your **Anthropic** or **OpenAI** API key
3. Click **Save**

---

## 🖥️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |

---

## 🔧 Component List

### shadcn/ui Components
- ✅ Button - Interactive button with variants
- ✅ Input - Text input field
- ✅ Textarea - Multi-line text input
- ✅ Dialog - Modal dialog component
- ✅ Tabs - Tabbed interface
- ✅ ScrollArea - Custom scrollable container
- ✅ Skeleton - Loading placeholder
- ✅ Tooltip - Hover tooltip

### Custom Components
- ✅ `Navbar` - Top navigation with logo and settings
- ✅ `ResizablePanel` - Draggable split panel
- ✅ `SettingsModal` - API key configuration
- ✅ `ChatPanel` - Main chat interface
- ✅ `ChatMessage` - Individual message bubble
- ✅ `ChatInput` - Auto-expanding input with send

---

## 🔐 Security Notes

- API keys are stored in **localStorage** (not cookies)
- Only the `apiKey` field is persisted via Zustand
- Keys are never sent to third-party servers
- Clear API key via Settings when done

---

## 📝 License

This project is for educational purposes. All trademarks belong to their respective owners.