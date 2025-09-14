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
import React from "react";
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

  //   start Add group
  const AddGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
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

        await loadGroups(setGroups);
      }
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi");
    } finally {
    }
  };

  // start Add Chat
  const AddChat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Email bo‘yicha userni qidirish
      if (newChatRef.current) {
        const userRes = await client.service("users").find({
          query: { email: newChatRef.current?.value },
        });

        if (!userRes.data.length) {
          alert("Bunday foydalanuvchi topilmadi");
          return;
        }

        const chatUser = userRes.data[0];

        // 2. O‘zi bilan chat yarata olmasligi uchun tekshirish
        if (user?._id === chatUser._id) {
          alert("Siz o‘zingiz bilan chat qilolmaysiz");
          newChatRef.current.value = "";
          return;
        }

        // 3. Oldin mavjud private chatni tekshirish
        const currentUserName = user?.fullName || user?.email;
        const otherUserName = chatUser.fullName || chatUser.email;

        const existingChat = await client.service("groups").find({
          query: {
            type: "private",
            $limit: 1,
            $or: [
              { name: `${currentUserName} & ${otherUserName}` },
              { name: `${otherUserName} & ${currentUserName}` },
            ],
          },
        });

        if (existingChat.data.length > 0) {
          alert("Bu foydalanuvchi bilan allaqachon chat mavjud");
          newChatRef.current.value = "";
          return;
        }

        // 4. Yangi chat nomini yasash
        const chatName = `${currentUserName} & ${otherUserName}`;

        // 5. Yangi private chat yaratish
        const newChat = await client.service("groups").create({
          type: "private",
          name: chatName,
        });

        // 6. Qarshi taraf userni qo‘shish
        await client.service("members").create({
          chatId: newChat._id,
          userId: chatUser._id,
          role: "member",
        });

        // 7. Current userni ham qo‘shish
        await client.service("members").create({
          chatId: newChat._id,
          userId: user!._id,
          role: "owner",
        });

        alert("Chat qo'shildi");
      }

      // 8. Formani tozalash
      newChatRef.current!.value = "";
      await loadGroups(setGroups);
    } catch (error) {
      console.error("AddChat error:", error);
      alert("Chat yaratishda xatolik yuz berdi");
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

  // end Add Chat

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
                <form onSubmit={AddChat}>
                  <DialogHeader>
                    <DialogTitle>Chat qo'shish</DialogTitle>
                    <DialogDescription>
                      Chat qo'shish uchun user emilini kiriting
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 mb-3">
                    <div className="grid gap-3">
                      <Label htmlFor="user-email">User emaili</Label>
                      <Input
                        id="user-email"
                        ref={newChatRef}
                        name="userEmail"
                        type="email"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Chat qo'shish</Button>
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
