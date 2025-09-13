"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import client from "@/lib/feathers-client";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Token bilan autentifikatsiya qilishga harakat qilamiz
        const response = await client.reAuthenticate();

        if (response.user) {
          // Foydalanuvchi mavjud bo'lsa chat-groups sahifasiga yo'naltirish
          router.push("/chat-groups");
        } else {
          // Foydalanuvchi mavjud bo'lmasa login sahifasiga yo'naltirish
          router.push("/login");
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  // Loading holati
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
