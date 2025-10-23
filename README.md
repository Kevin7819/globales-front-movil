# 🌍 Globales Front Móvil — Travel Information App

**Globales Front Móvil** is a modern **mobile frontend** built with **React Native + Expo**,  
designed to provide travelers with **cultural**, **health**, and **safety** information worldwide.  
It follows a **modular, scalable architecture** and integrates features like **interactive maps**, **local insights**, and **API-based content**.

---

## 🧠 Tech Stack

| Layer | Technologies |
| :---- | :------------ |
| **Frontend Framework** | React Native · Expo SDK 54 |
| **Navigation** | Expo Router · React Navigation |
| **UI & Animation** | Reanimated 4 · React Native Worklets |
| **Date & Time** | @react-native-community/datetimepicker |
| **API Integration** | RESTful Endpoints · Axios (or Fetch) |
| **Maps Integration** | Mapbox SDK for React Native |
| **Development Tools** | Node.js 18+ · Expo CLI · ADBKit · Git |

---

## ⚙️ Installation and Configuration

### 🧩 Requirements

Make sure you have the following tools installed:

- [Node.js 18+](https://nodejs.org/en/download)  
- npm or yarn  
- [Expo CLI](https://docs.expo.dev/get-started/installation/)  
- [Git](https://git-scm.com/)  
- [Android Studio](https://developer.android.com/studio) (for emulator setup)  
- Optional: [Xcode](https://developer.apple.com/xcode/) for iOS simulation  

---

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Kevin7819/globales-front-movil.git
cd globales-front-movil
````

---

### 2️⃣ Install dependencies

```bash
npm install
```

Then, install required Expo packages and additional libraries:

```bash
npm install expo@~54.0.11 expo-router@~6.0.9 expo-web-browser@~15.0.8 \
@react-native-community/datetimepicker@8.4.4 react-native-reanimated@~4.1.1 \
react-native-worklets
```

---

### 3️⃣ Android Configuration (Mapbox Setup)

To enable **Mapbox SDK** integration, edit the root-level `build.gradle` file:

```gradle
allprojects {
    repositories {
        google()
        mavenCentral()
        maven {
            url 'https://api.mapbox.com/downloads/v2/releases/maven'
            authentication {
                basic(BasicAuthentication)
            }
            credentials {
                username = 'mapbox'
                password = project.hasProperty("MAPBOX_DOWNLOADS_TOKEN") ? project.MAPBOX_DOWNLOADS_TOKEN : ""
            }
        }
        maven { url 'https://www.jitpack.io' }
    }
}
```

> ⚠️ **Note:** Add your `MAPBOX_DOWNLOADS_TOKEN` in your environment variables before building the project.

---

### 4️⃣ Device Setup (Optional)

If you want to test on a real Android device, install **ADBKit** globally:

```bash
npm install -g adbkit
```

Then check connected devices:

```bash
adb devices
```

---

### 5️⃣ Run the App

Start the Expo development server:

```bash
npm start
```

From **Expo DevTools**, you can launch the app on:

* 📱 Android Emulator
* 🍏 iOS Simulator (macOS only)
* 🌐 Web (Browser Mode)
* 📲 Physical Device via **Expo Go**

---

## 🧱 Project Structure

```
├── app/            # Main app screens and routing
├── components/     # Reusable UI components
├── constants/      # Colors, themes, and global settings
├── hooks/          # Custom hooks for logic reuse
├── assets/         # Images, icons, and media resources
├── scripts/        # Development utilities
└── package.json    # Dependencies and npm scripts
```

---

## 📜 Available Scripts

| Command                         | Description                                |
| :------------------------------ | :----------------------------------------- |
| `npm start`                     | Launches the development server via Expo   |
| `npm run android`               | Runs the app on Android emulator/device    |
| `npm run ios`                   | Runs the app on iOS simulator (macOS only) |
| `npm run web`                   | Runs the app in web mode                   |
| `node scripts/reset-project.js` | Clears caches and resets the project       |

---

## ⚠️ Common Issues

| Issue                                             | Cause                    | Solution                                              |
| :------------------------------------------------ | :----------------------- | :---------------------------------------------------- |
| `Cannot resolve module 'react-native-reanimated'` | Missing native rebuild   | Run `npx expo prebuild` and reinstall pods            |
| `Mapbox SDK download failed`                      | Missing or invalid token | Set `MAPBOX_DOWNLOADS_TOKEN` in your environment      |
| `Device not found`                                | ADB not detecting device | Run `adb devices` and ensure USB debugging is enabled |
| `Metro bundler stuck on loading`                  | Cache issue              | Run `npx expo start -c` to clear cache                |

---

## 📚 Useful Resources

* [React Native Documentation](https://reactnative.dev/docs/getting-started)
* [Expo Documentation](https://docs.expo.dev/)
* [Mapbox React Native SDK](https://docs.mapbox.com/android/maps/guides/)
* [Reanimated Docs](https://docs.swmansion.com/react-native-reanimated/)
* [DatetimePicker Docs](https://github.com/react-native-datetimepicker/datetimepicker)

---

## 👨‍💻 Author

**Kevin Abel Venegas Bermúdez**
🎓 *Computer Engineering Student – Universidad Nacional de Costa Rica*
📍 Heredia, Sarapiquí, Costa Rica
🔗 [GitHub Profile](https://github.com/Kevin7819)

```
