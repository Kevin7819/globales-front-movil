const API_URL = "http://localhost:5089/api";

export async function registerUser(data: any) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Error registering user");
    }

    return await response.json();
  } catch (err) {
    console.error("Register error:", err);
    throw err;
  }
}
