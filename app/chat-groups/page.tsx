"use client";
import { Button } from "@/components/shad-ui/button";
import client, { Group, Message, User } from "@/lib/feathers-client";
import { Avatar, AvatarFallback } from "@/components/shad-ui/avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Ghost, LogOut, Menu, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shad-ui/dropdown-menu";
import { Separator } from "@/components/shad-ui/separator";
import { Input } from "@/components/shad-ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shad-ui/dialog";

const Page = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChatName, setSelectedChatName] = useState("");
  const router = useRouter();

  const textRef = useRef<HTMLInputElement>(null);
  const newGroupRef = useRef<HTMLInputElement>(null);

  const memberEmailRef = useRef<HTMLInputElement>(null);

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
  }, [selectedGroup, messages]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLogout = async () => {
    try {
      await client.logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const AddGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newGroupRef.current) {
      const Addedgroup = await client.service("groups").create({
        name: newGroupRef.current.value,
      });

      await client.service("members").create({
        chatId: Addedgroup._id,
        userId: user!._id,
        role: "owner",
      });

      newGroupRef.current.value = "";
      alert("Guruh yaratildi");

      await loadGroups();
    }
  };

  useEffect(() => {
    const findChatName = async () => {
      if (selectedGroup) {
        const getSelectedChatName = await client
          .service("groups")
          .get(selectedGroup);

        if (getSelectedChatName) {
          setSelectedChatName(getSelectedChatName.name);
        }
      }
    };

    findChatName();
  }, [selectedGroup]);

  const AddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !selectedGroup) return;

    try {
      // 1️⃣ Current user member info
      const currentMemberRes = await client.service("members").find({
        query: {
          userId: user._id,
          chatId: selectedGroup,
        },
      });

      const currentMember = currentMemberRes.data[0];

      if (!currentMember) {
        return alert("Siz bu guruhga a'zo emassiz");
      }

      // 2️⃣ Foydalanuvchi owner ekanligini tekshirish
      if (currentMember.role !== "owner") {
        return alert("Faqat owner yangi member qo'sha oladi");
      }

      // 3️⃣ Kiritilgan emailni olish
      const email = memberEmailRef.current?.value?.trim();
      if (!email) return alert("Email kiritilmagan");

      // 4️⃣ Users service da tekshirish
      const userRes = await client.service("users").find({
        query: { email },
      });

      if (userRes.data.length === 0) {
        return alert("Bunday emailga ega foydalanuvchi topilmadi");
      }

      const newUser = userRes.data[0];

      // 5️⃣ Shu chatdagi member emasligini tekshirish
      const memberRes = await client.service("members").find({
        query: {
          chatId: selectedGroup,
          userId: newUser._id,
        },
      });

      if (memberRes.data.length > 0) {
        return alert("Bu foydalanuvchi allaqachon a'zo");
      }

      // 6️⃣ Hammasi to'g'ri bo'lsa member qo'shish
      await client.service("members").create({
        chatId: selectedGroup,
        userId: newUser._id,
        role: "member", // default role
      });

      alert("Foydalanuvchi muvaffaqiyatli qo'shildi");

      if (memberEmailRef.current) memberEmailRef.current.value = "";
    } catch (error) {
      console.error("Add member error:", error);
      alert("Xatolik yuz berdi, qayta urinib ko'ring");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await client.service("members").find({
      query: {
        chatId: selectedGroup,
        userId: user?._id,
      },
    });

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

    const member = response.data[0];

    if (!member) {
      if (textRef.current) {
        textRef.current.value = "";
      }
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
    <div className="w-full h-screen flex ">
      {/* Sidebar */}
      <div className="w-64 border-r-2 shadow-lg p-1 hidden lg:flex lg:flex-col border-gray-300 overflow-y-auto h-screen">
        {/* Chap sidebar content */}
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger className="text-neutral-500 shadow-sm font-medium m-1 cursor-pointer bg-gray-100 rounded-md px-2 py-1 ">
              <Menu />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="ml-2 shadow-lg w-[240px] mt-2">
              <DropdownMenuLabel className="text-md">
                {user?.fullName ? user.fullName : user?.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="text-md  font-medium">
                <Dialog>
                  {/* Trigger - faqat dialogni ochadi */}
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size={"lg"}
                      className="w-full justify-start"
                      title="Add member"
                    >
                      Guruh qo'shish
                    </Button>
                  </DialogTrigger>

                  {/* Dialog content ichida alohida form */}
                  <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={AddGroup}>
                      <DialogHeader>
                        <DialogTitle>Guruh qo'shish</DialogTitle>
                        <DialogDescription>
                          Qo'shmoqchi bo'lgan guruh nomini kiriting
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 mb-3">
                        <div className="grid gap-3">
                          <Label htmlFor="group-name">Guruh nomi</Label>
                          <Input
                            id="group-name"
                            ref={newGroupRef}
                            name="group"
                            type="text"
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Guruh qo'shish</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-md text-red-400 font-medium"
                onClick={handleLogout}
              >
                <LogOut /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Separator className="my-1" />
        {groups.map((group) => (
          <button
            key={group._id}
            onClick={() => setSelectedGroup(group._id)}
            className={`w-full flex flex-col  cursor-pointer rounded-md text-left my-0.5 px-2 py-4 text-lg ${
              selectedGroup === group._id
                ? "bg-blue-400 text-white hover:bg-blue-300"
                : "hover:bg-gray-200"
            } `}
          >
            <p>{group.name}</p>
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div
        className="flex-1 overflow-y-auto flex flex-col bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://ichip.ru/images/cache/2020/3/16/q90_390602_554a319b12c89169f198fc491.png')",
        }}
      >
        <div className="h-[50px] shadow-lg bg-white border-none flex items-center justify-between p-2 ">
          <div className="h-full flex items-center gap-3">
            <p className="font-medium text-xl ml-2  text-gray-900">
              {selectedChatName}
            </p>
          </div>
        </div>
        {/* Messages */}
        <div className="flex-1 scrollbar-hidden overflow-y-auto w-full lg:max-w-4/6 sm:max-w-full mx-auto p-4">
          {selectedGroup ? (
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
                      {!isOwnMessage && (
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
          ) : (
            <div></div>
          )}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        {selectedGroup && (
          <div className="w-full lg:max-w-4/6 mx-auto items-center border-t-1 border-gray-200 p-3 flex gap-2">
            <form onSubmit={handleSubmit} className="w-full flex gap-2">
              <input
                type="text"
                ref={textRef}
                required
                placeholder="Type a message..."
                className="w-full border-none rounded-lg  outline-none text-lg font-medium py-2 px-4 bg-white"
              />
            </form>
            <Dialog>
              {/* Trigger - faqat dialogni ochadi */}
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  title="Add member"
                  className="bg-gray-100 text-gray-500 hover:bg-blue-400 size-12 cursor-pointer hover:text-white rounded-full border-3 hover:border-blue-400 border-gray-500 "
                >
                  <Plus />
                </Button>
              </DialogTrigger>

              {/* Dialog content ichida alohida form */}
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={AddMember}>
                  <DialogHeader>
                    <DialogTitle>Guruhga a'zo qo'shish</DialogTitle>
                    <DialogDescription>
                      Qo'shmoqchi bo'lgan user emailini kiriting
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 mb-3">
                    <div className="grid gap-3">
                      <Label htmlFor="member-email">Email</Label>
                      <Input
                        id="member-email"
                        ref={memberEmailRef}
                        name="email"
                        type="email"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Guruhga qo'shish</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
