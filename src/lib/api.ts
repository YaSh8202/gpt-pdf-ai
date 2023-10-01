import { User } from "@/types";
import axios from "axios";

const api = axios.create({
  baseURL: "https://docugenius-api.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const refreshToken = async () => {
  try {
    const res = await api.get("/auth/refresh");

    if (res.status != 200) return null;

    return res.data.user as User;
  } catch (e) {
    console.log("error", e);
  }
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await refreshToken();
      } catch (e) {
        return Promise.reject(e);
      }

      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;

export const getLoggedInUser = async () => {
  try {
    const res = await api.get("/users/me");
    return res.data.data.user as User;
  } catch (e) {
    console.log("error", e);
    return null;
  }
};

export const createNewDoc = async ({
  title,
  url,
}: {
  title: string;
  url: string;
}) => {
  try {
    const res = await api.post("/docs", {
      title,
      url,
    });

    if (res.status != 201) return null;

    return res.data.data.doc;
  } catch (e) {
    console.log("error", e);
  }
};

export const sendQuestion = async ({
  docId,
  question,
}: {
  docId: string;
  question: string;
}) => {
  try {
    const res = await api.post(`/docs/${docId}/questions`, {
      question,
    });

    if (res.status != 201) return null;

    return res.data.data.question;
  } catch (e) {
    console.log("error", e);
  }
};


export const loginCall = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    if (res.status != 200) {
      throw new Error("Invalid credentials");
    }
    console.log(res.data);

    const token = res.data.access_token as string;

    return token;
  } catch (e) {
    console.log("error", e);
    throw new Error("Invalid credentials");
  }
};

export const registerCall = async ({
  name,
  email,
  password,
  passwordConfirm,
}: {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}) => {
  const data = await api.post("/auth/register", {
    name,
    passwordConfirm,
    email,
    password,
  });

  if (data.status != 201) {
    throw new Error("Invalid credentials");
  }

  const token = await loginCall({ email, password });

  return token;
};
