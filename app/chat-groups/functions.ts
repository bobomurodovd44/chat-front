// utils/loadGroups.ts
import client from "@/lib/feathers-client";
import { Group } from "../store/groupStore";

export const loadGroups = async (setGroups: (groups: Group[]) => void) => {
  try {
    const response = await client.service("groups").find({});
    setGroups(response.data);
  } catch (error) {
    console.error("Error loading groups:", error);
  }
};

// lib/loadMessages.ts
import { useMessageStore } from "../store/messageStore";
import { usePaginationStore } from "../store/messagePaginateStore";
import { useSelectedGroupStore } from "../store/selectedGroupStore";

export const loadMessages = async () => {
  const { selectedGroup } = useSelectedGroupStore.getState();
  const { setMessages } = useMessageStore.getState();
  const { limit, skip, setTotal } = usePaginationStore.getState();

  if (!selectedGroup?._id) return;

  try {
    const response = await client.service("messages").find({
      query: {
        chatId: selectedGroup._id,
        $sort: { createdAt: 1 },
        $skip: skip,
        $limit: limit, // ✅ dynamic limit
      },
    });

    setTotal(response.total); // ✅ pagination uchun
    setMessages(response.data); // ✅ current page messages
  } catch (error) {
    console.error("Error loading messages:", error);
  }
};
