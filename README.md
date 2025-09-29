npm start
# Globales Front Móvil

Este repositorio contiene el frontend móvil de la aplicación Globales, desarrollado con React Native y Expo.

## Requisitos previos

- [Node.js](https://nodejs.org/) (recomendado v18 o superior)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/) o [npm](https://www.npmjs.com/get-npm)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Git

## Instalación y ejecución

Sigue estos pasos para clonar e iniciar el proyecto:

1. **Clona el repositorio:**

	```sh
	git clone https://github.com/Kevin7819/globales-front-movil.git
	cd globales-front-movil
	```

2. **Instala las dependencias:**

	Usando Yarn:
	```sh
	yarn install
	```
	O usando npm:
	```sh
	npm install
	```

3. **Inicia el proyecto con Expo:**

	```sh
	npx expo start
	```
	Esto abrirá Expo DevTools en tu navegador. Desde ahí puedes ejecutar la app en un emulador, dispositivo físico o en la web.

## Estructura del proyecto

- `app/` - Código principal de la aplicación y pantallas.
- `components/` - Componentes reutilizables de UI.
- `constants/` - Temas y constantes globales.
- `hooks/` - Custom hooks.
- `assets/` - Imágenes y recursos estáticos.
- `scripts/` - Scripts útiles para el desarrollo.

## Scripts útiles

- `yarn start` o `npm start`: Inicia el servidor de desarrollo de Expo.
- `yarn android` o `npm run android`: Ejecuta la app en un emulador/dispositivo Android.
- `yarn ios` o `npm run ios`: Ejecuta la app en un emulador/dispositivo iOS (solo MacOS).
- `yarn web` o `npm run web`: Ejecuta la app en el navegador.
- `node scripts/reset-project.js`: Limpia cachés y resetea el proyecto.

## Notas adicionales

- Asegúrate de tener configurado un emulador o la app de Expo Go en tu dispositivo móvil.
- Si tienes problemas con dependencias, ejecuta `yarn install` o `npm install` nuevamente.
- Para más información, consulta la [documentación de Expo](https://docs.expo.dev/).

---

¡Listo! Ahora puedes contribuir o probar la aplicación Globales Front Móvil.