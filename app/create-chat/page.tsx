"use client";

import client, { User } from "@/lib/feathers-client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const page = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const newGroupRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to authenticate using stored token
        const response = await client.reAuthenticate();
        if (response.user) {
          setUser(response.user);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const AddGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newGroupRef.current) {
      const Addedgroup = await client.service("groups").create({
        name: newGroupRef.current.value,
      });

      await client.service("members").create({
        chatId: Addedgroup.group._id,
        userId: user!._id,
        role: "owner",
      });

      newGroupRef.current.value = "";

      router.push("/chat-groups");
    }
  };
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <form onSubmit={AddGroup} className="w-80 p-4">
        <input
          type="text"
          required
          ref={newGroupRef}
          className="w-full rounded-md border-2 border-gray-500 text-gray-600 text-lg py-1 px-3"
          placeholder="Guruh nomi ..."
        />
        <button
          type="submit"
          className=" cursor-pointer font-medium w-full mt-2.5 rounded-md py-1 text-lg text-white bg-blue-600"
        >
          Guruh qo'shish
        </button>
      </form>
    </div>
  );
};

export default page;
