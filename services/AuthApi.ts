import AsyncStorage from "@react-native-async-storage/async-storage";
import apiFetch from "./api";

export const AuthApi = {
  // 🧩 Login
  login: async (userName: string, password: string) => {
    const res = await apiFetch("/Auth/Login", {
      method: "POST",
      body: JSON.stringify({ userName, password }),
    });

    if (res.isSuccess && res.user?.token) {
      await AsyncStorage.multiSet([
        ["token", res.user.token],
        ["userId", res.user.id.toString()],
        ["role", res.user.role],
      ]);
    }

    return res;
  },

  // 🧠 Registro
  register: async (
    userName: string,
    email: string,
    password: string,
    countryOfOrigin: string,
    preferredLanguage: string,
    birthDate: Date
  ) => {
    const birthDateString = birthDate.toISOString().split("T")[0];
    const res = await apiFetch("/Auth/Register", {
      method: "POST",
      body: JSON.stringify({
        UserName: userName,
        Email: email,
        Password: password,
        CountryOfOrigin: countryOfOrigin,
        PreferredLanguage: preferredLanguage,
        BirthDate: birthDateString,
      }),
    });

    if (res.isSuccess && res.user?.token) {
      await AsyncStorage.multiSet([
        ["token", res.user.token],
        ["userId", res.user.id.toString()],
        ["role", res.user.role],
      ]);
    }

    return res;
  },

  logout: async () => {
    await AsyncStorage.multiRemove(["token", "userId", "role"]);
  },
};