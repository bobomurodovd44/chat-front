"use client";
import client, { Group, Message, User } from "@/lib/feathers-client";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const Page = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const router = useRouter();

  const textRef = useRef<HTMLInputElement>(null);

  const loadMessages = async () => {
    try {
      const response = await client.service("messages").find({
        query: {
          chatId: selectedGroup,
        },
      });

      setMessages(response.data);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const loadGroups = async () => {
    try {
      const response = await client.service("groups").find({});

      setGroups(response.data);
    } catch (error) {
      console.error("Error loading groups:", error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to authenticate using stored token
        const response = await client.reAuthenticate();
        if (response.user) {
          setUser(response.user);
          await loadGroups();
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
  }, [selectedGroup]);

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const chatService = client.service("groups");

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await client.service("members").find({
      query: {
        chatId: selectedGroup,
        userId: user?._id,
      },
    });

    const member = response.data[0];

    if (!member) {
      return alert("siz bu gurhga azo emassiz");
    }

    const newMessage = await client.service("messages").create({
      chatId: selectedGroup,
      senderId: member._id,
      text: textRef.current?.value,
    });

    setMessages((prev) => [...prev, newMessage]);

    if (textRef.current) {
      textRef.current.value = "";
    }
    if (messagesEndRef.current)
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

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

  return (
    <div className="w-full h-screen flex bg-gray-800">
      {/* Sidebar */}
      <div className="w-64 bg-gray-300 border-r-2 border-gray-500 overflow-y-auto h-screen">
        {/* Chap sidebar content */}
        <Link
          href="/create-chat"
          className="w-4/5 my-2 mx-auto
 rounded-md py-1 flex items-center justify-center bg-blue-600 text-lg text-white"
        >
          Guruh qo'shish
        </Link>
        {groups.map((group) => (
          <button
            key={group._id}
            onClick={() => setSelectedGroup(group._id)}
            className={`w-full flex pl-2 py-3 items-center cursor-pointer text-lg text-gray-200
   ${
     selectedGroup === group._id
       ? "bg-blue-500 hover:bg-blue-400"
       : "bg-gray-500 hover:bg-gray-400"
   }`}
          >
            {group.name}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto flex flex-col bg-gray-200">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedGroup ? (
            <>
              {messages.map((msg) => {
                const isOwnMessage = msg.senderUserId == user?._id;

                return (
                  <div
                    key={msg._id}
                    className={`mb-2 flex gap-2 ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isOwnMessage && (
                      <div className="size-10 flex items-center justify-center font-medium bg-gray-400 text-gray-800 text-md rounded-full">
                        {getInitials(msg.senderFullName)}
                      </div>
                    )}

                    <p
                      className={`max-w-xs px-4 py-2 font-medium rounded-2xl text-sm break-words ${
                        isOwnMessage
                          ? "bg-blue-600 text-white"
                          : "bg-gray-400 text-gray-800"
                      }`}
                    >
                      {msg.text}
                    </p>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-2xl">No selected Group</p>
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        {selectedGroup && (
          <form
            onSubmit={handleSubmit}
            className="bg-gray-200  border-t-2 border-gray-500 p-3 flex gap-3"
          >
            <input
              type="text"
              ref={textRef}
              required
              placeholder="Type a message..."
              className="w-4/5 border-2 border-gray-500  px-4 py-2 bg-gray-200 rounded-md focus:outline-none"
            />
            <button className="px-4 py-1 bg-blue-600 text-white text-lg rounded-md cursor-pointer">
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Page;
