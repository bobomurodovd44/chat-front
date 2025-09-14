"use client";

import React from "react";
import { useGroupStore } from "../store/groupStore";
import { useSelectedGroupStore } from "../store/selectedGroupStore";

const Sidebar = () => {
  const { groups } = useGroupStore();
  const { selectedGroup, setSelectedGroup } = useSelectedGroupStore();

  return (
    <div>
      {groups.map((group) => (
        <button
          key={group._id}
          onClick={() => setSelectedGroup(group)} // butun group yuboramiz
          className={`w-full flex flex-col cursor-pointer rounded-md text-left my-0.5 px-2 py-4 text-lg ${
            selectedGroup?._id === group._id
              ? "bg-blue-400 text-white hover:bg-blue-300"
              : "hover:bg-gray-200"
          }`}
        >
          <p>{group.name}</p>
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
