<div align="center">
  
  # ☁️ Cloud Server UI/UX
  
  **A premium, high-performance, and immersive cloud storage interface built for the modern web.**

  [![React](https://img.shields.io/badge/React-18-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Three.js](https://img.shields.io/badge/Three.js-WebGL-black.svg?style=for-the-badge&logo=three.js)](https://threejs.org/)
  [![Express](https://img.shields.io/badge/Express-Backend-green.svg?style=for-the-badge&logo=express)](https://expressjs.com/)

</div>

---

## ✨ Overview

**Cloud Server** is a full-stack, award-winning caliber cloud storage dashboard. It marries world-class design aesthetics with powerful functionality, offering an experience that rivals top-tier SaaS platforms like Vercel, Stripe, and Linear. 

The platform features an ultra-premium **WebGL-powered 3D authentication screen** ("Liquid Aurora") driven by custom GLSL shaders, deep glassmorphism UI elements, and a completely functional Node.js/Express backend that handles physical file storage, secure JWT authentication, and user data management.

## 🚀 Key Features

### 🎨 Immersive & Premium UI/UX
- **Liquid Aurora 3D Login**: A custom WebGL fluid shader background that runs at a locked 60FPS, providing a silky-smooth, iridescent entry point to the application.
- **Deep Glassmorphism**: Utilizes multi-layered backdrop blurs, 1px light-leak borders, and subtle glow effects for a tactile, frosted-glass interface.
- **Micro-Interactions**: Features custom Framer Motion animations, including "magnetic" buttons that physically react to cursor movement and seamless page transitions.

### ⚙️ Robust Full-Stack Architecture
- **Real File System**: The backend securely provisions isolated, physical storage directories for every registered user.
- **Secure Authentication**: Includes full user registration, `bcrypt` password hashing, JWT session management, and "Remember Me" persistent local storage.
- **Integrated Productivity Suite**: Beyond file storage, the platform includes connected data structures for **Calendar**, **Mail**, **Tasks**, and **Talk** (chat) seamlessly tied to the active user's backend profile.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 & TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS & Framer Motion
- **3D Engine**: Three.js, React Three Fiber (R3F), & Custom GLSL Shaders
- **Icons**: Lucide React

### Backend
- **Server**: Node.js & Express
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **Storage**: Native File System (`fs`) & Multer (for file uploads)
- **Database**: Local JSON Data Stores for rapid prototyping and deployment

---

## 💻 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shikhar-Kesharwani/cloud_server.git
   cd cloud_server
   ```

2. **Install dependencies:**
   ```bash
   # Install frontend and backend dependencies
   npm install
   ```

3. **Start the local server & frontend:**
   ```bash
   # Start the Vite development server (usually runs on port 8080 or 3000)
   npm run dev
   ```
   *(Note: Ensure your Express backend is also running to serve API requests for authentication and file uploads).*

### Default Admin Login (Optional)
If you wish to bypass registration for testing, you can use the default local admin credentials:
- **Username:** `admin`
- **Password:** `password`

---

## 💎 Design Philosophy

This project was built with the conviction that enterprise tools do not have to look boring. By leveraging **React Three Fiber** for ambient 3D backgrounds and **Tailwind CSS** for meticulous typography and spacing, we achieve a UI that is not only functional but emotionally resonant. 

The aesthetic heavily relies on dark-mode optimizations, subtle gradients, and physical rendering concepts (transmission, refraction, and environmental lighting) to create depth.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<div align="center">
  <p>Built with passion and pixel-perfection.</p>
</div>