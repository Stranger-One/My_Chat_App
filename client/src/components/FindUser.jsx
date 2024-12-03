import React, { useEffect, useState } from "react";
import { LuSend } from "react-icons/lu";
import { RiLinksFill } from "react-icons/ri";
import Button from "./Button";
import { IoSearch } from "react-icons/io5";
import { searchUsers } from "../services/authService.js";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const FindUser = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  const handleSearch = async () => {
    const response = await searchUsers(searchQuery);
    setSearchResult(response.users);
    // console.log(response);
  };

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    } else {
      setSearchResult([]);
    }
  }, [searchQuery]);

  return (
    <div className="w-full h-full relative text-text pt-20">
      <h1 className="capitalize text-text text-2xl font-semibold w-full text-center mb-10">Find Users You want to chat with</h1>
      <div className="w-[80%] mx-auto flex gap-4 ">
        <div className="flex w-full rounded-md bg-surface items-center px-2 bg-secondary">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full p-2 outline-none border-none bg-transparent placeholder:text-text/70 "
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button>
          <IoSearch size={20} className="text-text" />
        </Button>
      </div>
      <div className="search-result w-[80%] mx-auto bg-secondary min-h-[200px] max-h-[300px] overflow-auto mt-6 rounded-md ">
        {searchResult.length > 0 ? (
          searchResult.map((user, index) => (
            <Link
              key={index}
              to={`/chat/${user._id}`}
              className="w-full grid grid-cols-[40px_auto] p-1 gap-2 hover:bg-surface/60 rounded-md"
            >
              <div
                className="w-10 h-10 rounded-full overflow-hidden bg-cover"
                style={{
                  backgroundImage: `url(https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png)`,
                }}
              >
                {user?.profilePic && <img
                  src={user.profilePic}
                  alt="user avatar"
                  className="w-full h-full object-cover "
                />}
              </div>

              <div className="">
                <h2 className="user-name line-clamp-1 font-semibold capitalize leading-5">
                  {user.name}
                </h2>
                <p className="active-status line-clamp-1 leading-5 text-text/70">
                  {user.email}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="font-semibold text-xl flex items-center justify-center w-full h-[200px] ">
            No Search Results
          </div>
        )}
      </div>
    </div>
  );
};

export default FindUser;
