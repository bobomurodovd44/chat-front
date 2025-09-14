import React from "react";
import { useEffect } from "react";
import { useMessageStore } from "../store/messageStore";
import { useRef } from "react";
import { useSelectedGroupStore } from "../store/selectedGroupStore";
import { useUserStore } from "../store/userStore";
import { Avatar, AvatarFallback } from "@/components/shad-ui/avatar";

const Messages = () => {
  const { messages } = useMessageStore();
  const { selectedGroup, setSelectedGroup } = useSelectedGroupStore();
  const { user } = useUserStore();

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!selectedGroup) return null;

  return (
    <>
      {messages.map((msg) => {
        const isOwnMessage = msg.senderUserId == user?._id;

        return (
          <div key={msg._id} className="flex flex-col gap-1 mb-4  ">
            <div
              className={`flex gap-2 ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              {/* Foydalanuvchi avatar */}
              {!isOwnMessage && selectedGroup?.type != "private" && (
                <Avatar className="w-8 h-8 bg-gray-200">
                  <AvatarFallback>
                    {getInitials(msg.senderFullName)}
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Message bubble */}
              <p
                className={`max-w-[60%] px-3 py-2 rounded-xl text-sm font-medium break-words ${
                  isOwnMessage
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.text}
              </p>
            </div>

            {/* Timestamp */}
            <p
              className={`text-xs text-gray-400 ${
                isOwnMessage ? "text-right" : "ml-[50px]"
              }`}
            >
              {formatTime(msg.createdAt)}
            </p>
          </div>
        );
      })}
    </>
  );
};

export default Messages;
