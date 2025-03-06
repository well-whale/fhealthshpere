import { GoogleAuth } from "google-auth-library";
import serviceAccount from "./serviceAccountKey.json"; 

export const getAccessToken = async () => {
  try {
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    return accessToken.token;
  } catch (error) {
    console.error("⚠️ Lỗi khi lấy Access Token:", error);
  }
};
