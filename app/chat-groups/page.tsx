"use client";
import client from "@/lib/feathers-client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import Actions from "./Actions";
import Sidebar from "./Sidebar";
import Messages from "./Messages";
import MessageForm from "./MessageForm";
import { useSelectedGroupStore } from "../store/selectedGroupStore";
import { useGroupStore } from "../store/groupStore";
import { useMessageStore } from "../store/messageStore";
import { useUserStore } from "../store/userStore";
import { Separator } from "@/components/shad-ui/separator";
import CustomLoading from "./CustomLoading";
import { loadGroups } from "./functions";
import Header from "./Header";

const Page = () => {
  const { setGroups } = useGroupStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { selectedGroup } = useSelectedGroupStore();
  const [isLoading, setIsLoading] = useState(true);
  const { setUser } = useUserStore();
  const { messages, setMessages } = useMessageStore();
  const [selectedChatName, setSelectedChatName] = useState("");
  const router = useRouter();

  const loadMessages = async () => {
    try {
      console.log("Load messages uchun ID:", selectedGroup?._id);

      const response = await client.service("messages").find({
        query: { chatId: selectedGroup?._id },
      });

      console.log("Backend javobi:", response);

      setMessages(response.data);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to authenticate using stored token
        const response = await client.reAuthenticate();
        if (response.user) {
          setUser(response.user);
          await loadGroups(setGroups);
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

  useEffect(() => {
    const getMessages = async () => {
      if (selectedGroup) {
        await loadMessages();
      }
    };

    getMessages();
  }, [selectedGroup?._id]);

  useEffect(() => {
    console.log(selectedGroup);
  }, [selectedGroup]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedGroup, messages]);

  useEffect(() => {
    const findChatName = async () => {
      if (selectedGroup) {
        const getSelectedChatName = await client
          .service("groups")
          .get(selectedGroup._id);

        if (getSelectedChatName) {
          setSelectedChatName(getSelectedChatName.name);
        }
      }
    };

    findChatName();
  }, [selectedGroup]);

  if (isLoading) {
    return <CustomLoading />;
  }

  return (
    <div className="w-full h-screen flex ">
      {/* Sidebar */}
      <div className="w-64 border-r-2 shadow-lg p-1 lg:w-50 lg:flex-col border-gray-300 overflow-y-auto h-screen">
        {/* Chap sidebar content */}
        <Actions />
        <Separator className="my-1" />
        <Sidebar />
      </div>

      {/* Chat area */}
      <div
        className="flex-1 overflow-y-auto flex flex-col bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://ichip.ru/images/cache/2020/3/16/q90_390602_554a319b12c89169f198fc491.png')",
        }}
      >
        <Header />
        {/* Messages */}
        <div className="flex-1 scrollbar-hidden overflow-y-auto w-full lg:max-w-4/6 sm:max-w-full mx-auto p-4">
          <Messages />
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        <MessageForm messagesEndRef={messagesEndRef} />
      </div>
    </div>
  );
};

export default Page;
