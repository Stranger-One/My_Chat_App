import React, { useCallback, useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import ChatUser from "./ChatUser";
import { useDispatch, useSelector } from "react-redux";
import {
  findConversation,
  getAllConversation,
} from "../services/messageServices";
import { setAllConversation, setAllUserStatus } from "../store/globalSlice";
import { useSocket } from "../contexts/SocketProvider";
import UserStatus from "./UserStatus";
import { IoIosArrowDown } from "react-icons/io";
import { getAllStatus } from "../services/UpdateServeces";
import toast from "react-hot-toast";

const UpdatesSection = ({ className }) => {
  const userData = useSelector((state) => state.global.userData);
  const allUserStatus = useSelector(state => state.global.allUserStatus)
  const dispatch = useDispatch();
  const socket = useSocket();
  const [unseenStatus, setUnseenStatus] = useState([]);
  const [seenStatus, setSeenStatus] = useState([]);

  const [isSeenUpdatedOpen, setIsSeenUpdatedOpen] = useState(true);
  const [isRecentUpdatedOpen, setIsRecentUpdatedOpen] = useState(true);

  // console.log("allUserStatus", allUserStatus);

  const myStatus = {
    user: userData,
    file: "",
    message: "add a status",
    seen: [],
    _id: "674bf0db9af56910918c7d6e",
    createdAt: "2024-12-01T05:15:07.914Z",
  };


  // const fetchUpdates = async () => {
  //   const allStatus = await getAllStatus()
  //   console.log(allStatus);
  // };

  useEffect(()=>{
    // fetchUpdates()
    if(socket){  
      socket.emit("get_status")
    }
  }, [])

  const handleGetStatus = useCallback((response)=>{
    // console.log("get_status", response);
    dispatch(setAllUserStatus(response))
  }, [])


  useEffect(()=>{
    if(socket){

      socket.on("get_status", handleGetStatus)
      
      return ()=>{
        socket.off("get_status", handleGetStatus)
      }
    }
  }, [socket, handleGetStatus])

  return (
    <div
      className={`${className} h-[calc(100vh-50px)] bg-secondary text-text md:h-full`}
    >
      <div className=" flex items-center p-4">
        <h1 className="font-bold text-xl">Updates</h1>
      </div>
      <hr className="border-background" />
      <div className="p-2">
        <UserStatus status={myStatus} myStatus />
      </div>
      <div className="flex flex-col gap-1 p-1 overflow-auto md:h-[calc(100vh-150px)] ">
        <div className="w-full border-t-2 border-background">
          <div className="w-full p-1 flex items-center justify-between">
            <p className="text-sm font-semibold">Recent Updates</p>
            <label htmlFor="recentUpdates">
              <div className={`rounded-full flex items-center justify-center cursor-pointer duration-100 p-1 hover:bg-background ${isRecentUpdatedOpen ? '' : '-rotate-90'}`}>
                <IoIosArrowDown size={20} />
              </div>
            </label>
            <input onChange={()=> setIsRecentUpdatedOpen((check)=> !check)} type="checkbox" id="recentUpdates" className=" hidden" />
          </div>
          <div
            className={`${
              isRecentUpdatedOpen ? "h-fit" : "h-0"
            }  overflow-hidden duration-100 `}
          >
            {allUserStatus?.length > 0 ? (
              allUserStatus.map((status, index) => (
                <UserStatus key={index} status={status} index={index} />
              ))
            ) : (
              <div className="w-full h-full flex items-center">
                <h1 className="mx-auto">No Status Available</h1>
              </div>
            )}
          </div>
        </div>
        <div className="w-full border-y-2 border-background">
          <div className="w-full p-1 flex items-center justify-between">
            <p className="text-sm font-semibold">Seen Updates</p>
            <label htmlFor="seenUpdates">
              <div className={`rounded-full flex items-center justify-center cursor-pointer duration-100 p-1 hover:bg-background ${isSeenUpdatedOpen ? '' : '-rotate-90'}`}>
                <IoIosArrowDown size={20} />
              </div>
            </label>
            <input onChange={()=> setIsSeenUpdatedOpen((check)=> !check)} type="checkbox" id="seenUpdates" className=" hidden" />
          </div>
          <div
            className={`${
              isSeenUpdatedOpen ? "h-fit" : "h-0"
            }  overflow-hidden duration-100 `}
          >
            {/* <UserStatus status={myStatus} />
            <UserStatus status={myStatus} />
            <UserStatus status={myStatus} />
            <UserStatus status={myStatus} />
            <UserStatus status={myStatus} />
            <UserStatus status={myStatus} />
            <UserStatus status={myStatus} />
            <UserStatus status={myStatus} />
            <UserStatus status={myStatus} /> */}
          </div>
        </div>
        {/* {allConversation?.length > 0 ? (
          allConversation?.map((conversation, index) => (
            <UserStatus
              setSearchQuery={setSearchQuery}
              key={index}
              conversation={conversation}
            />
          ))
        ) : (
          <div className="text-center text-gray-400 text-lg p-2">
            No conversations
          </div>
        )} */}
        {/* <div className="w-full h-fit ">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Modi dignissimos officia, provident ipsa esse earum veniam exercitationem rerum voluptates quo iste. Reprehenderit aperiam autem quo impedit incidunt numquam repellat maxime placeat repudiandae unde dolores iusto architecto, dolore vel nostrum saepe facere quibusdam deleniti illum nesciunt, adipisci harum sed! Nostrum cum aperiam excepturi maxime, tempora quia corrupti! Quisquam dolore aut, at fugit pariatur recusandae neque hic dignissimos animi accusantium voluptatum eum, dolores ducimus dolor, minus veritatis? Cumque veniam, voluptas ullam nihil id quod accusamus debitis, saepe quos molestias sint ipsam tempora culpa suscipit exercitationem atque? Obcaecati quo quas libero error reiciendis. Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum cumque rem odio quod modi sed fugit veniam eum, sequi, velit necessitatibus quaerat veritatis tempore nulla reprehenderit repudiandae animi laboriosam commodi debitis laborum, omnis similique mollitia esse. Cumque ex aspernatur sint neque consequatur odio distinctio quaerat at dolorum natus nemo dicta id laborum provident modi dolor, suscipit sunt dolorem, nam beatae, maxime voluptate nesciunt quas reiciendis! Repudiandae aperiam numquam quae maiores minus, quibusdam molestiae, velit voluptatibus commodi ad eos. Provident laborum quidem, quibusdam dolor necessitatibus perferendis quaerat sit tempora fugit asperiores dolore magni, minima, facere eos? Ullam, corrupti! Repellat, error quod.
        </div> */}
      </div>
    </div>
  );
};

export default UpdatesSection;
