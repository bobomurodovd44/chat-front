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

    console.log("id:", id, typeof id);
    console.log("user._id:", user._id, typeof user._id);

    try {
      // Role tekshiruvi
      const response = await client.service("members").find({
        query: {
          chatId: id.toString(),
          userId: user._id.toString(),
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
      await client.service("groups").remove(id.toString());

      // Guruhlarni yangilash
      try {
        await loadGroups();
      } catch (err) {
        console.error("Guruhlarni yuklashda xatolik:", err);
      }

      // Tanlangan guruhni tozalash
      if (selectedGroup?._id.toString() === id.toString()) {
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
