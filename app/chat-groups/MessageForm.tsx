import React from "react";
import { useSelectedGroupStore } from "../store/selectedGroupStore";
import { useMessageStore } from "../store/messageStore";
import client from "@/lib/feathers-client";
import { useUserStore } from "../store/userStore";
import { useRef } from "react";
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
import { Button } from "@/components/shad-ui/button";
import { Plus } from "lucide-react";
import { Label } from "@/components/shad-ui/label";
import { Input } from "@/components/shad-ui/input";

type MessageFormProps = {
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

const MessageForm = ({ messagesEndRef }: MessageFormProps) => {
  const { selectedGroup } = useSelectedGroupStore();
  const { messages, setMessages, addMessage } = useMessageStore();
  const { user, setUser } = useUserStore();
  const memberUsernameRef = useRef<HTMLInputElement>(null);

  const textRef = useRef<HTMLInputElement>(null);

  //   Add new message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await client.service("members").find({
        query: {
          chatId: selectedGroup?._id,
          userId: user?._id,
        },
      });

      const member = response.data[0];

      if (!member) {
        if (textRef.current) textRef.current.value = "";
        alert("Siz bu guruhga a'zo emassiz");
        return;
      }

      const newMessage = await client.service("messages").create({
        chatId: selectedGroup?._id,
        senderId: member._id,
        text: textRef.current?.value,
      });

      addMessage(newMessage);
      if (textRef.current) textRef.current.value = "";
      if (messagesEndRef?.current)
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error(error);
      alert("Xatolik yuz berdi, qayta urinib ko‘ring");
    } finally {
    }
  };

  //   Add new member
  const AddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !selectedGroup) {
      return;
    }

    try {
      // 1️⃣ Current user member info
      const currentMemberRes = await client.service("members").find({
        query: {
          userId: user._id,
          chatId: selectedGroup._id,
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
      const username = memberUsernameRef.current?.value?.trim();
      if (!username) {
        return alert("Username kiritilmagan");
      }

      // 4️⃣ Users service da tekshirish
      const userRes = await client.service("users").find({
        query: { username },
      });

      if (userRes.data.length === 0) {
        return alert("Bunday emailga ega foydalanuvchi topilmadi");
      }

      const newUser = userRes.data[0];

      // 5️⃣ Shu chatdagi member emasligini tekshirish
      const memberRes = await client.service("members").find({
        query: {
          chatId: selectedGroup._id,
          userId: newUser._id,
        },
      });

      if (memberRes.data.length > 0) {
        return alert("Bu foydalanuvchi allaqachon a'zo");
      }

      // 6️⃣ Hammasi to'g'ri bo'lsa member qo'shish
      await client.service("members").create({
        chatId: selectedGroup._id,
        userId: newUser._id,
        role: "member", // default role
      });

      alert("Foydalanuvchi muvaffaqiyatli qo'shildi");

      if (memberUsernameRef.current) memberUsernameRef.current.value = "";
    } catch (error) {
      console.error("Add member error:", error);
      alert("Xatolik yuz berdi, qayta urinib ko'ring");
    } finally {
    }
  };

  if (!selectedGroup) return null;

  return (
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
      {selectedGroup?.type != "private" && (
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
                  <Label htmlFor="member-username">Username</Label>
                  <Input
                    id="member-username"
                    ref={memberUsernameRef}
                    name="username"
                    type="text"
                    required
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
      )}
    </div>
  );
};

export default MessageForm;
