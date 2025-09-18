import React from "react";
import { useEffect } from "react";
import { useMessageStore } from "../store/messageStore";
import { useRef } from "react";
import { useSelectedGroupStore } from "../store/selectedGroupStore";
import { useUserStore } from "../store/userStore";
import { Avatar, AvatarFallback } from "@/components/shad-ui/avatar";
import FileDisplay from "./FileDisplay";
import client from "@/lib/feathers-client";
import { usePaginationStore } from "../store/messagePaginateStore";
import { loadMessages } from "./functions";

const Messages = () => {
  const { messages, setMessages } = useMessageStore();
  const { skip, limit, total, setTotal, setSkip } = usePaginationStore();
  const { selectedGroup, setSelectedGroup } = useSelectedGroupStore();
  const { user } = useUserStore();

  useEffect(() => {
    if (selectedGroup?._id) {
      setSkip(0);
      loadMessages();
    }
  }, [selectedGroup?._id]);

  // skip yoki limit o‘zgarsa qayta yuklash
  useEffect(() => {
    if (selectedGroup?._id) {
      loadMessages();
    }
  }, [skip, limit, selectedGroup?._id]);

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
              <div className="flex max-w-[60%] flex-col gap-1 ">
                {msg.fileUrl && (
                  <FileDisplay
                    fileUrl={msg.fileUrl}
                    fileType={msg.fileType}
                    fileName={msg.fileName}
                  />
                )}
                {msg.text && (
                  <p
                    className={`max-w-full w-fit px-3 py-2 rounded-xl text-sm font-medium break-words ${
                      isOwnMessage
                        ? "bg-blue-600 text-white self-end"
                        : "bg-gray-200 text-gray-800 self-start"
                    }`}
                  >
                    {msg.text}
                  </p>
                )}
              </div>
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
