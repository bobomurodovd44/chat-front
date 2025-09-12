"use client";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import React, { useEffect, useRef } from "react";

const Page = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <div className="w-full h-screen flex bg-gray-800">
      {/* Sidebar */}
      <div className="w-64 bg-gray-300 border-r-2 border-gray-500 overflow-y-auto h-screen">
        {/* Chap sidebar content */}
        <button className="w-full flex pl-2 py-3 hover:bg-gray-400 bg-gray-500 items-center cursor-pointer text-lg text-gray-200">
          Group Name
        </button>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto flex flex-col bg-gray-200">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="w-fit mb-2 gap-2 flex">
            <div className="size-10 flex items-center justify-center font-medium bg-gray-400 text-gray-800 text-md rounded-4xl">
              {getInitials("Bobomurodov Dilshod")}
            </div>
            <p className="max-w-xs px-4 py-2 font-medium rounded-2xl text-sm text-gray-800 bg-gray-400 break-words">
              Lorem, ipsum dolor.
            </p>
          </div>
          <div className=" gap-2 flex">
            <div className="size-10 flex items-center justify-center font-medium bg-gray-400 text-gray-800 text-md rounded-4xl">
              {getInitials("Bobomurodov Dilshod")}
            </div>
            <p className="max-w-1/2 px-4 py-2 font-medium rounded-2xl text-sm text-gray-800 bg-gray-400 break-words">
              Lorem, ipsum dolor Lorem, ipsum dolor Lorem, ipsum dolor.
            </p>
          </div>
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        <form className="bg-gray-200  border-t-2 border-gray-500 p-3 flex gap-3">
          <input
            type="text"
            placeholder="Type a message..."
            className="w-4/5 border-2 border-gray-500  px-4 py-2 bg-gray-200 rounded-md focus:outline-none"
          />
          <button className="px-4 py-1 bg-blue-600 text-white text-lg rounded-md cursor-pointer">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;
