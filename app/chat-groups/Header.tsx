import React from "react";
import { useSelectedGroupStore } from "../store/selectedGroupStore";

const Header = () => {
  const { selectedGroup } = useSelectedGroupStore();
  return (
    <div className="h-[50px] shadow-lg bg-white border-none flex items-center justify-between p-2 ">
      <div className="h-full flex items-center gap-3">
        <p className="font-medium text-xl ml-2  text-gray-900">
          {selectedGroup?.name ? selectedGroup?.name : "Realtime chat app"}
        </p>
      </div>
    </div>
  );
};

export default Header;
