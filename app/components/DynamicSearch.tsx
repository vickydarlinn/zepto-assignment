"use client";
import React, { useState, useRef, useEffect } from "react";
import { fakeData } from "../utils/data";
import { RxCross2 } from "react-icons/rx";
import Image from "next/image";

interface User {
  id: number;
  name: string;
  email: string;
}

const DynamicSearch: React.FC = () => {
  const allUsers: User[] = fakeData;
  const [activeUser, setActiveUser] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [lastChipIndex, setLastChipIndex] = useState<number | null>(null);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectRef = useRef<HTMLDivElement>(null);

  const setChange = () => {
    const selected = selectRef?.current?.querySelector(".active");
    if (selected) {
      selected?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const filterSuggestions = (input: string) => {
    return allUsers.filter((suggestion) => {
      const suggestionValue =
        typeof suggestion === "string" ? suggestion : suggestion.name;
      return (
        suggestionValue.toLowerCase().includes(input) &&
        !selectedUsers.some(
          (user) => user?.name?.toLowerCase() === suggestionValue.toLowerCase()
        )
      );
    });
  };

  const showAllSuggestions = () => {
    setFilteredUsers(allUsers.filter((user) => !selectedUsers.includes(user)));
    setShowSuggestions(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget.value.toLowerCase();
    const newFilteredSuggestions = filterSuggestions(input);

    setActiveUser(0);
    setFilteredUsers(newFilteredSuggestions);
    setShowSuggestions(true);
    setSearchQuery(input);
  };

  useEffect(() => {
    setFilteredUsers((users) =>
      users.filter(
        (user) => !selectedUsers.some((selected) => selected.id === user.id)
      )
    );
  }, [selectedUsers]);

  const renderAutocomplete = () => {
    if (showSuggestions) {
      setChange();
      return (
        <div className="border h-96 overflow-auto" ref={selectRef}>
          {filteredUsers.map((suggestion, index) => (
            <div
              className={`hover:bg-gray-200 cursor-pointer flex gap-2 items-center p-2 rounded-lg ${
                index === activeUser ? "active" : ""
              }`}
              key={suggestion.id}
              onClick={() => handleClick(suggestion)}
            >
              <span className="rounded-[50%] flex justify-center items-center overflow-hidden h-12 w-12">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb"
                  alt="profile"
                  width={50}
                  height={50}
                  style={{ objectFit: "cover" }}
                />
              </span>
              <span className="text-gray-600">{suggestion.name}</span>
              <span className="text-gray-400">{suggestion.email}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleClick = (user: User) => {
    setActiveUser(0);
    setFilteredUsers([]);
    setShowSuggestions(false);
    setSearchQuery("");
    setSelectedUsers((users) => [...users, user]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter") {
      setActiveUser(0);
      setShowSuggestions(false);
      setSearchQuery("");
      const selectedUser = filteredUsers[activeUser];
      if (selectedUser) {
        setSelectedUsers((users) => [...users, selectedUser]);
        setFilteredUsers((users) =>
          users.filter((user) => user.id !== selectedUser.id)
        );
      }
    } else if (e.code === "ArrowUp") {
      e.preventDefault();
      setActiveUser((prev) => (prev === 0 ? prev : prev - 1));
    } else if (e.code === "ArrowDown") {
      setActiveUser((prev) =>
        prev === filteredUsers.length - 1 ? prev : prev + 1
      );
    } else if (e.code === "Backspace" && !searchQuery) {
      if (lastChipIndex !== null) {
        // If last chip is highlighted, remove it
        setSelectedUsers((users) => [
          ...users.slice(0, lastChipIndex),
          ...users.slice(lastChipIndex + 1),
        ]);
        setFilteredUsers((users) => [...users, selectedUsers[lastChipIndex]]);
        setLastChipIndex(null);
      } else {
        // Find the index of the last chip
        setLastChipIndex(selectedUsers.length - 1);
      }
    }
  };
  const handleRemove = (e: React.MouseEvent<HTMLSpanElement>, user: User) => {
    setSelectedUsers((users) => users.filter((u) => u.id !== user.id));
  };

  return (
    <div className="border-b-2 border-gray-700 pb-1 flex flex-wrap gap-3 mt-20 mx-10">
      {selectedUsers.map((user, index) => (
        <div
          key={user?.id}
          className={`border p-1 px-2 rounded-lg flex gap-2 items-center ${
            index === lastChipIndex ? "border-2 border-orange-200" : ""
          }`}
        >
          <span> {user?.name}</span>
          <span
            className="cursor-pointer"
            onClick={(e) => handleRemove(e, user)}
          >
            <RxCross2 />
          </span>
        </div>
      ))}
      <div className="grow relative">
        <input
          value={searchQuery}
          onClick={showAllSuggestions}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          type="text"
          className="w-full h-full focus:outline-none focus:border-none"
        />

        <div className="absolute left-0 top-[100%] flex flex-col">
          {renderAutocomplete()}
        </div>
      </div>
    </div>
  );
};

export default DynamicSearch;
