"use client";

import React from "react";
import { useGroupStore } from "../store/groupStore";
import { useSelectedGroupStore } from "../store/selectedGroupStore";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/shad-ui/context-menu";
import client from "@/lib/feathers-client";
import { loadGroups } from "./functions";
import { useUserStore } from "../store/userStore";

const Sidebar = () => {
  const { groups, setGroups } = useGroupStore();
  const { selectedGroup, setSelectedGroup } = useSelectedGroupStore();
  const { user } = useUserStore();

  const DeleteGroup = async (id: string) => {
    if (!user?._id) {
      alert("Foydalanuvchi aniqlanmadi");
      return;
    }

    try {
      // Foydalanuvchining role tekshiruvi
      const response = await client.service("members").find({
        query: {
          chatId: id,
          userId: user._id,
        },
      });

      const member = response.data[0];

      if (!member) {
        alert("Siz bu guruhga azo emassiz");
        return;
      }

      if (member.role !== "owner") {
        alert("Siz guruhni o'chirish huquqiga ega emassiz");
        return;
      }

      // Guruhni o'chirish
      await client.service("groups").remove(id);

      // Guruhlarni yangilash
      try {
        await loadGroups(setGroups);
      } catch (err) {
        console.error("Guruhlarni yuklashda xatolik:", err);
      }

      // Agar o'chirilgan guruh tanlangan bo'lsa, selectedGroup-ni tozalash
      if (selectedGroup?._id === id) {
        setSelectedGroup(null);
      }
    } catch (error) {
      console.error("Guruhni o'chirishda xatolik:", error);
      alert("Guruhni o'chirishda xatolik yuz berdi");
    }
  };

  return (
    <div>
      {groups.length > 0 ? (
        groups.map((group) => (
          <ContextMenu key={group._id}>
            <ContextMenuTrigger asChild>
              <button
                className={`w-full flex flex-col cursor-pointer rounded-md text-left my-0.5 px-2 py-4 text-lg ${
                  selectedGroup?._id === group._id
                    ? "bg-blue-400 text-white hover:bg-blue-300"
                    : "hover:bg-gray-200"
                }`}
                onClick={() => setSelectedGroup(group)} // group tanlash left-click bilan
              >
                <p>{group.name}</p>
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => DeleteGroup(group._id)}
                className="text-red-600"
              >
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))
      ) : (
        <p className="mt-3 mx-1 text-lg text-neutral-600 font-normal">
          Hozircha Group yoki Chat yo'q
        </p>
      )}
    </div>
  );
};

export default Sidebar;
