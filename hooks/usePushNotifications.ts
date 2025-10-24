// hooks/usePushNotifications.ts
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// Usar apiFetch existente y userService local
import apiFetch from '../services/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    (async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
        // Enviar token a tu backend ligado al usuario autenticado
        try {
          await apiFetch(
            '/notifications/register',
            {
              method: 'POST',
              body: JSON.stringify({ token, platform: Platform.OS }),
            },
            true
          );
        } catch (e) {
          console.warn('No se pudo registrar el token en backend', e);
        }
      }
    })();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((_notification) => {
        // Aquí podés actualizar UI si querés
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as any;
        // Ej: navegar según payload: router.push(`/trips/${data?.tripId}`);
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return { expoPushToken };
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Push no disponible en simulador web/desktop.');
    return null;
  }

  // Permisos (iOS muestra prompt; en Android 13+ se solicita en runtime)
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.warn('Permisos de notificaciones denegados.');
    return null;
  }

  // Obtener token de Expo
  // En dev/prod build, el projectId viene embebido; este fallback intenta leerlo.
  const projectId =
    (Constants?.expoConfig as any)?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId;

  const token = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );
  return token.data;
}