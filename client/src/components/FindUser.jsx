import React, { useEffect, useState } from "react";
import { IoSearch, IoClose } from "react-icons/io5";
import { searchUsers } from "../services/authService.js";
import { Link } from "react-router-dom";

const FindUser = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await searchUsers(searchQuery);
      setSearchResult(response?.users || []);
    } catch (e) {
      console.error("Search error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="w-full h-full flex flex-col bg-wa-panel-light dark:bg-wa-panel-dark text-wa-text-primary-light dark:text-wa-text-primary-dark select-none">
      {/* Search Bar */}
      <div className="p-3 border-b border-wa-border-light dark:border-wa-border-dark">
        <div className="relative flex items-center bg-wa-surface rounded-xl px-3 py-2 focus-within:ring-1 focus-within:ring-wa-teal">
          <IoSearch size={18} className="text-wa-text-secondary-light dark:text-wa-text-secondary-dark mr-2" />
          <input
            type="text"
            placeholder="Search name or email to start chatting..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-wa-text-secondary-light dark:placeholder:text-wa-text-secondary-dark"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-wa-text-secondary-light dark:text-wa-text-secondary-dark"
            >
              <IoClose size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Results / Contacts List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-wa-teal">
          Contacts on WhatsApp
        </div>

        {searchResult && searchResult.length > 0 ? (
          searchResult.map((user) => (
            <Link
              key={user._id}
              to={`/chat/${user._id}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-wa-hover-light dark:hover:bg-wa-surface transition-colors"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={user.profilePic || "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-semibold truncate capitalize">
                  {user.name}
                </h3>
                <p className="text-xs text-wa-text-secondary-light dark:text-wa-text-secondary-dark truncate">
                  {user.about || user.email}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-wa-text-secondary-light dark:text-wa-text-secondary-dark text-xs">
            {loading ? (
              <p>Searching contacts...</p>
            ) : (
              <p>Type a name or email above to find users.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindUser;
