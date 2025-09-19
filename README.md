# Comegle Frontend

Comegle is a community-driven web application for **college students** to discover and connect with interest-based communities, and instantly join 1:1 video calls with peers. Our matching lobby offers preference-based matching (by state and gender).  
Authentication ensures only verified college students (and select test emails) can sign up—anonymous signups are **not allowed**.

---

## 🌐 Live Demo

- [Main Site](https://www.comegle.live)
- [Vercel Preview](https://comegle-frontend.vercel.app)

---

## 🚀 Features

- **Interest-based communities** for college students, matching students from different colleges across INDIA
- **Edit your profile sections** easily to share more about yourself
- **Share your social links quickly in the chat lobby** for instant connections
- **1:1 video calling** via WebRTC
- **Preference-based matching** (state, gender)
- **Real-time chat & lobby** using WebSockets
- **Secure authentication:** Only verified college students allowed
- **Fast, modern stack:** React + TypeScript + Vite

---

## 🛠️ Local Development

### 1. Clone the repo

```bash
git clone https://github.com/IAMAmanRaj/Comegle_Frontend.git
cd Comegle_Frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file in the **root folder** of the project.  
Add the following dummy environment variables:

```env
VITE_SOCKET_SERVER_URL=""
VITE_GOOGLE_CLIENT_ID=""
VITE_MAIN_SERVER_URL=""
```

> **Note:** These are example values. Update them to match your backend and Google OAuth setup as needed.

### 4. Run the app

```bash
npm run dev
```

The app should now be running locally at `http://localhost:5173` (or whichever port Vite reports).

---

## 📝 Tech Stack

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Socket.IO](https://socket.io/)
- [WebRTC](https://webrtc.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## ⚙️ ESLint Configuration

For production apps, we recommend enabling **type-aware lint rules** in your ESLint config.  
Here's an example using [@typescript-eslint/eslint-plugin](https://typescript-eslint.io/) and some React plugins:

```js
// eslint.config.js
import tseslint from 'typescript-eslint'
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  tseslint.globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Recommended type-aware rules
      ...tseslint.configs.recommendedTypeChecked,
      // Stricter rules (optional)
      ...tseslint.configs.strictTypeChecked,
      // Stylistic rules (optional)
      ...tseslint.configs.stylisticTypeChecked,
      // React-specific rules
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

---

## 📧 Signup Requirements

- Only **college student emails** (and a few test emails) are allowed to sign up.
- Anonymous registrations are blocked.

---

## 📄 License

MIT

---

## 🙏 Contributing

Pull requests and feedback are welcome!  
Feel free to open issues and help improve the platform for college communities.
