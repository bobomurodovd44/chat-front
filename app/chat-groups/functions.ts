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
