import React, { useEffect, useState } from "react";
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
import { Plus, Upload } from "lucide-react";
import { Label } from "@/components/shad-ui/label";
import { Input } from "@/components/shad-ui/input";
import { loadMessages } from "./functions";

type MessageFormProps = {
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

const MessageForm = ({ messagesEndRef }: MessageFormProps) => {
  const { selectedGroup } = useSelectedGroupStore();
  const { messages, setMessages, addMessage } = useMessageStore();
  const { user, setUser } = useUserStore();
  const memberUsernameRef = useRef<HTMLInputElement>(null);

  const textRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log(selectedGroup);
  }, [selectedGroup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!selectedGroup || !user) return;

    const text = textRef.current?.value?.trim();
    const file = fileRef.current?.files?.[0];

    // text ham, fayl ham bo‘lmasa qaytamiz
    if (!text && !file) return;

    setIsSubmitting(true);
    try {
      // 1️⃣ A'zo ekanligini tekshirish
      const response = await client.service("members").find({
        query: { chatId: selectedGroup._id, userId: user._id },
      });
      const member = response.data[0];
      if (!member) {
        if (textRef.current) textRef.current.value = "";
        alert("Siz bu guruhga a'zo emassiz");
        return;
      }

      // 2️⃣ Agar fayl bo‘lsa, upload qilish
      let fileMeta = {};
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("http://localhost:3030/express/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("File upload failed");
        }

        const uploaded = await res.json();
        fileMeta = {
          fileUrl: uploaded.fileUrl,
          fileName: uploaded.fileName,
          fileSize: uploaded.fileSize,
          fileType: uploaded.fileType,
        };

        // inputni tozalash
        if (fileRef.current) fileRef.current.value = "";
      }

      // 3️⃣ Message yaratish
      const newMessage = await client.service("messages").create({
        chatId: selectedGroup._id,
        senderId: member._id,
        text,
        ...fileMeta,
      });

      // 4️⃣ Inputni tozalash va scroll
      if (textRef.current) textRef.current.value = "";
      if (messagesEndRef?.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error(error);
      alert("Xatolik yuz berdi, qayta urinib ko‘ring");
    } finally {
      setIsSubmitting(false);
    }
  };

  //   Add new member
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // multiple submitni oldini olish
    if (!user || !selectedGroup) return;

    const username = memberUsernameRef.current?.value?.trim();
    if (!username) return alert("Username kiritilmagan");

    setIsSubmitting(true); // submit bosildi
    try {
      // 1️⃣ Current user member info
      const currentMemberRes = await client.service("members").find({
        query: { userId: user._id, chatId: selectedGroup._id },
      });
      const currentMember = currentMemberRes.data[0];
      if (!currentMember) return alert("Siz bu guruhga a'zo emassiz");

      // 2️⃣ Owner tekshirish
      if (currentMember.role !== "owner") {
        return alert("Faqat owner yangi member qo'sha oladi");
      }

      // 3️⃣ Users service da tekshirish
      const userRes = await client
        .service("users")
        .find({ query: { username } });
      if (!userRes.data.length) return alert("Bunday username topilmadi");

      const newUser = userRes.data[0];

      // 4️⃣ Shu chatdagi member emasligini tekshirish
      const memberRes = await client.service("members").find({
        query: { chatId: selectedGroup._id, userId: newUser._id },
      });
      if (memberRes.data.length > 0)
        return alert("Bu foydalanuvchi allaqachon a'zo");

      // 5️⃣ Member qo'shish
      await client.service("members").create({
        chatId: selectedGroup._id,
        userId: newUser._id,
        role: "member",
      });

      alert("Foydalanuvchi muvaffaqiyatli qo'shildi");

      // 6️⃣ Inputni tozalash
      if (memberUsernameRef.current) memberUsernameRef.current.value = "";
    } catch (error) {
      console.error("Add member error:", error);
      alert("Xatolik yuz berdi, qayta urinib ko'ring");
    } finally {
      setIsSubmitting(false); // submit tugadi
    }
  };

  if (!selectedGroup) return null;

  return (
    <div className="w-full lg:max-w-4/6 mx-auto items-center border-t-1 border-gray-200 p-3 flex gap-2">
      <form onSubmit={handleSubmit} className="w-full flex gap-2">
        <div className="flex w-full">
          <input
            type="text"
            ref={textRef}
            placeholder="Type a message..."
            className="w-full border-none rounded-tl-lg rounded-bl-lg  outline-none text-lg font-medium py-2 px-4 bg-white"
          />
          <label
            htmlFor="fileUpload"
            className="font-medium py-2 px-4 bg-white text-lg rounded-tr-lg rounded-br-lg border-l-2 border-gray-600"
          >
            <Upload />
          </label>
          <input id="fileUpload" type="file" ref={fileRef} className="hidden" />
        </div>
        <Button type="submit">Send</Button>
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
            <form onSubmit={handleAddMember}>
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
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? "loading ..." : "Guruhga qo'shish"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MessageForm;
