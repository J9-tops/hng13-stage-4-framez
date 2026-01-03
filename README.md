# Framez 📸

Framez is a high-performance, modern mobile application designed for sharing and discovering beautiful frames. Built with React Native and Expo, it offers a sleek, intuitive experience for community-driven content sharing.

## ✨ Features

- 🔐 **Secure Authentication**: Firebase-powered Login and Sign Up flows to keep your account safe.
- 🏠 **Dynamic Feed**: Real-time browsing of community posts with likes and engagement.
- 📸 **Post Creation**: Effortless image uploads and content sharing via Firebase Cloud Storage.
- 👤 **Customizable Profiles**: Manage your digital presence and view your shared frames.
- 🎨 **Premium UI/UX**: A polished, responsive interface using Lucide Icons and themed components.
- 🏎️ **Fast Performance**: Optimized rendering and smooth navigation using Expo Router.

## 🚀 Tech Stack

- **Frontend**: [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Backend**: [Firebase](https://firebase.google.com/) (Auth, Firestore, Storage)
- **Icons**: [Lucide React Native](https://lucide.dev/guide/packages/lucide-react-native)
- **Styling**: Native Components & Themed Views

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/) (Recommended package manager)
- [Expo Go](https://expo.dev/go) app on your mobile device or an emulator (iOS/Android)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd framez-mobile
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm start
   ```

### Running the App

- Scan the QR code with **Expo Go** (Android) or the **Camera app** (iOS).
- Press `a` for Android Emulator.
- Press `i` for iOS Simulator.
- Press `w` for Web.

## 📂 Project Structure

- `app/`: Contains the main application routes and screens (Expo Router).
- `components/`: Reusable UI components and themed elements.
- `context/`: Authentication and global state management.
- `services/`: API and third-party service integrations (Firebase).
- `hooks/`: Custom React hooks for shared logic.
- `constants/`: App-wide constants (colors, layout values).
