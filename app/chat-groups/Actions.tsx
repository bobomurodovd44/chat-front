import { Button } from "@/components/shad-ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shad-ui/dropdown-menu";
import { Input } from "@/components/shad-ui/input";
import { Label } from "@/components/shad-ui/label";
import { LogOut, Menu } from "lucide-react";
import React, { useState } from "react";
import { useUserStore } from "../store/userStore";
import client from "@/lib/feathers-client";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useGroupStore } from "../store/groupStore";
import { loadGroups } from "./functions";

const Actions = () => {
  const { user } = useUserStore();
  const { setGroups } = useGroupStore();
  const newGroupRef = useRef<HTMLInputElement>(null);
  const newChatRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);
  const [isSubmittingChat, setIsSubmittingChat] = useState(false);

  const handleSubmit = async (type: "group" | "chat") => {
    const ref = type === "group" ? newGroupRef : newChatRef;
    if (!ref.current) return;

    const value = ref.current.value.trim();
    if (!value) return;

    // agar allaqachon submit bo'layotgan bo'lsa return qilamiz
    if (
      (type === "group" && isSubmittingGroup) ||
      (type === "chat" && isSubmittingChat)
    )
      return;

    if (type === "group") setIsSubmittingGroup(true);
    if (type === "chat") setIsSubmittingChat(true);

    try {
      if (type === "group") {
        const newGroup = await client.service("groups").create({ name: value });
        await client
          .service("members")
          .create({ chatId: newGroup._id, userId: user!._id, role: "owner" });
        alert("Guruh yaratildi");
      }

      if (type === "chat") {
        const userRes = await client
          .service("users")
          .find({ query: { username: value } });
        if (!userRes.data.length)
          throw new Error("Bunday foydalanuvchi topilmadi");

        const chatUser = userRes.data[0];
        if (chatUser._id === user?._id)
          throw new Error("Siz o'zingiz bilan chat qura olmaysiz");

        // Oldin mavjud private chatni tekshirish
        const existing = await client.service("groups").find({
          query: {
            type: "private",
            $limit: 1,
            $or: [
              { name: `${user?.username} & ${chatUser.username}` },
              { name: `${chatUser.username} & ${user?.username}` },
            ],
          },
        });
        if (existing.data.length > 0)
          throw new Error("Bu foydalanuvchi bilan allaqachon chat mavjud");

        const chatName = `${user?.username} & ${chatUser.username}`;
        const newChat = await client
          .service("groups")
          .create({ type: "private", name: chatName });

        await client.service("members").create({
          chatId: newChat._id,
          userId: chatUser._id,
          role: "member",
        });
        await client
          .service("members")
          .create({ chatId: newChat._id, userId: user!._id, role: "owner" });

        alert("Chat qo'shildi");
      }

      ref.current.value = "";
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Xatolik yuz berdi");
    } finally {
      if (type === "group") setIsSubmittingGroup(false);
      if (type === "chat") setIsSubmittingChat(false);
    }
  };

  const handleLogout = async () => {
    try {
      await client.logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  return (
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
                  title="Add Group"
                >
                  Guruh qo'shish
                </Button>
              </DialogTrigger>

              {/* Dialog content ichida alohida form */}
              <DialogContent className="sm:max-w-[425px]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit("group");
                  }}
                >
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
                    <Button type="submit" disabled={isSubmittingGroup}>
                      {isSubmittingGroup ? "loading ..." : "Guruh qo'shish"}
                    </Button>{" "}
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </DropdownMenuItem>
          {/* start add Private Chat */}
          <DropdownMenuItem asChild className="text-md  font-medium">
            <Dialog>
              {/* Trigger - faqat dialogni ochadi */}
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size={"lg"}
                  className="w-full justify-start"
                  title="Add Group"
                >
                  Chat qo'shish
                </Button>
              </DialogTrigger>

              {/* Dialog content ichida alohida form */}
              <DialogContent className="sm:max-w-[425px]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit("chat");
                  }}
                >
                  <DialogHeader>
                    <DialogTitle>Chat qo'shish</DialogTitle>
                    <DialogDescription>
                      Chat qo'shish uchun username kiriting
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 mb-3">
                    <div className="grid gap-3">
                      <Label htmlFor="user-email">Username</Label>
                      <Input
                        id="user-email"
                        ref={newChatRef}
                        name="userEmail"
                        type="text"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmittingChat}>
                      {isSubmittingChat ? "loading ..." : "Chat qo'shish"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </DropdownMenuItem>
          {/* end add Private Chat */}
          <DropdownMenuItem
            className="text-md text-red-400 font-medium"
            onClick={handleLogout}
          >
            <LogOut /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Actions;
