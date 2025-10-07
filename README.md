# 🌍 Globales Front Móvil

Frontend móvil de la aplicación **Globales**, desarrollado con **React Native** y **Expo**.  
Este proyecto busca ofrecer una experiencia ágil, moderna y optimizada para viajeros que desean información cultural, sanitaria y de seguridad.

---

## 📋 Requisitos previos

Antes de iniciar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) **v18+** (recomendado LTS)
- [npm](https://www.npmjs.com/) o [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Git](https://git-scm.com/)

modificar el build.gradle

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


---

## 🚀 Instalación y ejecución

1. **Clona el repositorio:**
   ```sh
   git clone https://github.com/Kevin7819/globales-front-movil.git
   cd globales-front-movil
   ```

2. **Instala las dependencias principales:**
   ```sh
   npm install
   ```

3. **Instala librerías adicionales necesarias para el proyecto:**
   ```sh
   npm install expo@~54.0.11 expo-router@~6.0.9 expo-web-browser@~15.0.8 @react-native-community/datetimepicker@8.4.4 react-native-reanimated@~4.1.1
   npm install react-native-worklets
   ```

4. **Inicia el servidor de desarrollo con Expo:**
   ```sh
   npm start
   ```
   Esto abrirá **Expo DevTools** en tu navegador.  
   Desde ahí puedes ejecutar la app en:
   - 📱 Emulador Android
   - 🍏 Simulador iOS (solo MacOS)
   - 🌐 Navegador (modo web)
   - 📲 Dispositivo físico usando **Expo Go**

---

## 📂 Estructura del proyecto

```
├── app/          # Código principal y pantallas
├── components/   # Componentes reutilizables de UI
├── constants/    # Temas, estilos y constantes globales
├── hooks/        # Custom hooks
├── assets/       # Imágenes y recursos estáticos
├── scripts/      # Scripts útiles para desarrollo
└── package.json  # Configuración de dependencias
```

---

## 🛠️ Scripts útiles

- `npm start` → Inicia el servidor de desarrollo con Expo
- `npm run android` → Ejecuta en emulador/dispositivo Android
- `npm run ios` → Ejecuta en emulador iOS (solo MacOS)
- `npm run web` → Ejecuta en el navegador
- `node scripts/reset-project.js` → Limpia cachés y resetea el proyecto

---

## 📌 Notas adicionales

- Asegúrate de tener configurado **Android Studio** o **Xcode** si planeas usar emuladores.
- En caso de errores de dependencias, ejecuta:
  ```sh
  rm -rf node_modules
  npm install
  ```
- Para más información consulta la [📖 documentación oficial de Expo](https://docs.expo.dev/).

---
