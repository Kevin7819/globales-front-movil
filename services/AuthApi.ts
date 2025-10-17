import AsyncStorage from "@react-native-async-storage/async-storage";
import apiFetch from "./api";

export const AuthApi = {
  // LOGIN
  login: async (email: string, password: string) => {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
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

  // REGISTER
  register: async (
    name: string,
    email: string,
    password: string,
    countryOfOrigin: string,
    preferredLanguage: string,
    birthDate: Date
  ) => {
    const birthDateString = birthDate.toISOString().split("T")[0];

    const payload = {
      name, //nombres exactos según tu backend
      email,
      password,
      countryOfOrigin,
      preferredLanguage,
      birthDate: birthDateString,
    };

    const res = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
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

  // LOGOUT
  logout: async () => {
    await AsyncStorage.multiRemove(["token", "userId", "role"]);
  },
};
