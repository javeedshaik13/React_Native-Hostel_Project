# DigiLocker Mobile - React Native App

A secure, modern document management mobile application built with React Native and Expo.

## 🚀 Features

- **Secure Document Storage**: Store and manage important documents securely
- **Document Organization**: Categorize documents by type (ID, PDF, Images, Certificates)
- **Quick Access**: Fast access to frequently used documents
- **Search & Filter**: Powerful search and filtering capabilities
- **Theme Support**: Dark mode and light mode with system preference sync
- **Cloud Sync**: Automatic cloud synchronization for backups
- **Profile Management**: Manage user profile and preferences
- **Enhanced UI/UX**: Modern animations, smooth transitions, and polished interface

## 📱 Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Storage**: AsyncStorage
- **Animations**: React Native Reanimated
- **Styling**: StyleSheet with dynamic theming
- **Icons**: Expo Vector Icons (Ionicons)

## 🛠️ Setup & Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npx expo start
   ```

3. **Run on your device**
   - Scan the QR code with Expo Go app (Android/iOS)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Press `w` for web browser

## 📁 Project Structure

```
DigiLocker-Mobile/
├── app/                    # Expo Router screens
│   ├── (app)/             # Authenticated screens
│   ├── (auth)/            # Authentication screens
│   └── _layout.jsx        # Root layout
├── components/            # Reusable components
│   └── ui/               # UI components (Toast, Modal, Buttons, etc.)
├── store/                # Zustand state stores
├── contexts/             # React contexts (Theme, etc.)
├── constants/            # Constants and configurations
├── utils/                # Utility functions
└── assets/               # Images and fonts
```

## ✨ UI Components

- **SuccessToast**: Animated toast notifications for user feedback
- **ConfirmationModal**: Custom confirmation dialogs
- **CustomButton**: Reusable button with variants (primary, cancel, secondary)
- **ThemeToggle**: Theme switcher component
- **QuickAccessSidebar**: Slide-in navigation panel
- **AnimatedCard**: Press-to-scale card animation

## 🎨 Theming

The app supports three theme modes:
- **Light Mode**: Clean, bright interface
- **Dark Mode**: Comfortable dark interface
- **System**: Follows system preference

Theme preference is automatically saved and persisted across app restarts.

## 📚 Documentation

- **ENHANCEMENTS.md**: Complete list of UI/UX enhancements
- **ANIMATION_ENHANCEMENTS.md**: Animation implementation details
- **QUICKSTART.md**: Quick reference guide

## 🧪 Development Commands

```bash
# Start development server
npx expo start

# Clear cache and restart
npx expo start --clear

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios

# Type checking
npx tsc --noEmit
```

## 🔧 Environment Setup

Make sure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## 📄 License

This project is private and confidential.

## 👥 Contributors

Developed with ❤️ using React Native and Expo

