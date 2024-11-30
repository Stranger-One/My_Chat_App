import React, { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import ChatUser from "./ChatUser";
import { useDispatch, useSelector } from "react-redux";
import {
  findConversation,
  getAllConversation,
} from "../services/messageServices";
import { setAllConversation } from "../store/authSlice";
import { useSocket } from "../contexts/SocketProvider";

const ChatSection = ({className}) => {
  const allConversation = useSelector((state) => state.auth.allConversation);
  const userData = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const socket = useSocket();


  const handleFindConversations = async () => {
    const response = await findConversation(searchQuery, userData._id);
    // console.log("find conversations", response.users);
    dispatch(setAllConversation(response?.users))
  };


  useEffect(() => {
    if(searchQuery){
      handleFindConversations()
    } else {
      socket.emit("request-all-conversation", userData?._id);
    }
  }, [searchQuery]);

  return (
    <div className={`${className} h-[calc(100vh-50px)] bg-secondary text-text md:h-full`} >
      <div className=" flex items-center p-4">
        <h1 className="font-bold text-xl">Let's Chat</h1>
      </div>
      <hr className="border-background" />
      <div className="p-2">
        <div className="w-full grid grid-cols-[20px_auto] bg-white/70 items-center px-2 gap-2 rounded-lg">
          <IoSearch size={20} />
          <input
            type="search"
            placeholder="Search"
            className="bg-transparent text-black placeholder:text-black py-2 md:py-[6px] outline-none border-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <hr className="border-background" />
      <div className="flex flex-col gap-1 p-1 overflow-auto md:h-[calc(100vh-150px)] ">
        {allConversation?.length > 0 ? (
          allConversation?.map((conversation, index) => (
            <ChatUser setSearchQuery={setSearchQuery} key={index} conversation={conversation} />
          ))
        ) : (
          <div className="text-center text-gray-400 text-lg p-2">
            No conversations
          </div>
        )}
        {/* <div className="w-full h-fit ">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Modi dignissimos officia, provident ipsa esse earum veniam exercitationem rerum voluptates quo iste. Reprehenderit aperiam autem quo impedit incidunt numquam repellat maxime placeat repudiandae unde dolores iusto architecto, dolore vel nostrum saepe facere quibusdam deleniti illum nesciunt, adipisci harum sed! Nostrum cum aperiam excepturi maxime, tempora quia corrupti! Quisquam dolore aut, at fugit pariatur recusandae neque hic dignissimos animi accusantium voluptatum eum, dolores ducimus dolor, minus veritatis? Cumque veniam, voluptas ullam nihil id quod accusamus debitis, saepe quos molestias sint ipsam tempora culpa suscipit exercitationem atque? Obcaecati quo quas libero error reiciendis. Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum cumque rem odio quod modi sed fugit veniam eum, sequi, velit necessitatibus quaerat veritatis tempore nulla reprehenderit repudiandae animi laboriosam commodi debitis laborum, omnis similique mollitia esse. Cumque ex aspernatur sint neque consequatur odio distinctio quaerat at dolorum natus nemo dicta id laborum provident modi dolor, suscipit sunt dolorem, nam beatae, maxime voluptate nesciunt quas reiciendis! Repudiandae aperiam numquam quae maiores minus, quibusdam molestiae, velit voluptatibus commodi ad eos. Provident laborum quidem, quibusdam dolor necessitatibus perferendis quaerat sit tempora fugit asperiores dolore magni, minima, facere eos? Ullam, corrupti! Repellat, error quod.
        </div> */}
      </div>
    </div>
  );
};

export default ChatSection;
