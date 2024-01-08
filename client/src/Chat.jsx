import React, { useContext, useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { uniqBy } from "lodash";
import axios from "axios";
import { UserContext } from "./UserContext.jsx";
import Contact from "./Contact.jsx";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [offlinePeople, setOfflinePeople] = useState({});
  const { username, id, setId, setUsername } = useContext(UserContext);
  const divUnderMessages = useRef();

  // useEffect(() => {
  //   connectToWs();
  // }, [selectedUserId]);

  // useEffect(() => {
  //   function connectToWs() {
  //     const ws = new WebSocket("ws://localhost:4000");
  //     setWs(ws);
  //     ws.addEventListener("message", handleMessage);
  //     ws.addEventListener("close", () => {
  //       setTimeout(() => {
  //         console.log("Disconnected, trying to reconnect");
  //         connectToWs();
  //       }, 1000);
  //     });
  //   }

  //   connectToWs();
  // }, [selectedUserId, handleMessage]);

  useEffect(() => {
    const handleMessage = (e) => {
      const messageData = JSON.parse(e.data);
      console.log({ e, messageData });
      if ("online" in messageData) {
        showOnlinePeople(messageData.online);
      } else if ("text" in messageData) {
        if (messageData.sender === selectedUserId) {
          setMessages((prev) => [...prev, messageData]);
        }
      }
    };

    const ws = new WebSocket("ws://localhost:4000");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Disconnected, trying to reconnect");
        // Note: You might want to extract this into a separate function if needed
        ws.close();
        const newWs = new WebSocket("ws://localhost:4000");
        setWs(newWs);
        newWs.addEventListener("message", handleMessage);
      }, 1000);
    });

    // Cleanup function to remove event listeners and close the WebSocket connection
    return () => {
      ws.removeEventListener("message", handleMessage);
      ws.close();
    };
  }, [selectedUserId]);

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }

  // const handleMessage =
  //   ((e) => {
  //     const messageData = JSON.parse(e.data);
  //     console.log({ e, messageData });
  //     if ("online" in messageData) {
  //       showOnlinePeople(messageData.online);
  //     } else if ("text" in messageData) {
  //       if (messageData.sender === selectedUserId) {
  //         setMessages((prev) => [...prev, messageData]);
  //       }
  //     }
  //   },
  //   [selectedUserId]);

  function logout() {
    axios.post("/logout").then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
    });
  }

  function sendMessage(e, file = null) {
    if (e) e.preventDefault();

    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
        file,
      })
    );
    if (file) {
      axios.get("/messages/" + selectedUserId).then((res) => {
        setMessages(res.data);
      });
    } else {
      setNewMessageText("");
      setMessages((prev) => [
        ...prev,
        {
          text: newMessageText,
          sender: id,
          recipient: selectedUserId,
          _id: Date.now(),
        },
      ]);
    }
  }

  function sendFile(ev) {
    const reader = new FileReader();
    reader.readAsDataURL(ev.target.files[0]);
    reader.onload = () => {
      sendMessage(null, {
        name: ev.target.files[0].name,
        data: reader.result,
      });
    };
  }

  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    axios.get("/people").then((res) => {
      const offlinePeopleArr = res.data
        .filter((p) => p._id !== id)
        .filter((p) => !Object.keys(onlinePeople).includes(p._id));

      const offlinePeople = {};
      offlinePeopleArr.forEach((p) => {
        offlinePeople[p._id] = p;
      });

      setOfflinePeople(offlinePeople);
    });
  }, [onlinePeople, id]);

  useEffect(() => {
    if (selectedUserId) {
      axios.get("/messages/" + selectedUserId).then((res) => {
        setMessages(res.data);
      });
    }
  }, [selectedUserId]);

  const onlinePeopleExcludingOurUser = { ...onlinePeople };
  delete onlinePeopleExcludingOurUser[id];

  const messagesWithoutDupes = uniqBy(messages, "_id");

  return (
    <React.StrictMode>
      <div className="flex h-screen">
        <div className="bg-blue-100 w-1/3 flex flex-col">
          <div className="flex-grow">
            <Logo />

            {Object.keys(onlinePeopleExcludingOurUser).map((userId) => (
              <Contact
                key={userId}
                id={userId}
                username={onlinePeopleExcludingOurUser[userId]}
                onClick={() => setSelectedUserId(userId)}
                selected={userId === selectedUserId}
                online={true}
              />
            ))}

            {Object.keys(offlinePeople).map((userId) => (
              <div className="opacity-20" key={userId}>
                <Contact
                  id={userId}
                  username={offlinePeople[userId].username}
                  onClick={() => setSelectedUserId(userId)}
                  selected={userId === selectedUserId}
                  online={false}
                />
              </div>
            ))}
          </div>

          <div className="p-4 text-center flex flex-col items-center">
            <span className="text-sm font-thin italic mb-2">
              Welcome {username}!
            </span>
            <button
              onClick={logout}
              className="bg-blue-300 opacity-60 font-semibold p-2 rounded-md shadow-sm shadow-indigo-700">
              LogOut
            </button>
          </div>
        </div>
        <div className="bg-blue-300 w-2/3 flex flex-col p-2">
          <div className="flex-grow">
            {!selectedUserId && (
              <div className="flex flex-grow h-full items-center justify-center">
                <div className="text-gray-400 text-lg italic">
                  &larr; Select a person to start a chat
                </div>
              </div>
            )}
            {!!selectedUserId && (
              <div className="relative h-full p-2">
                <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                  {messagesWithoutDupes.map((message) => (
                    <div
                      key={message._id}
                      className={
                        message.sender === id ? "text-right" : "text-left"
                      }>
                      <div
                        className={
                          "text-left inline-block p-2 m-2 rounded-md text-sm " +
                          (message.sender === id
                            ? "bg-blue-500"
                            : "bg-gray-200")
                        }>
                        {message.text}
                        {message.file && (
                          <div className="">
                            <a
                              target="_blank"
                              className="flex items-end gap-1 border-b"
                              rel="noreferrer noopener"
                              href={
                                axios.defaults.baseURL +
                                "/uploads/" +
                                message.file
                              }>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-4 h-4">
                                <path
                                  fillRule="evenodd"
                                  d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
                                  clipRule="evenodd"
                                />
                              </svg>

                              {message.file}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={divUnderMessages}></div>
                </div>
              </div>
            )}
          </div>
          {!!selectedUserId && (
            <form className="flex gap-1 " onSubmit={sendMessage}>
              <div className="bg-gray-300 flex p-2 items-center cursor-pointer rounded-md border border-gray-400">
                <label>
                  <input type="file" className="hidden" onChange={sendFile} />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
                    />
                  </svg>
                </label>
              </div>

              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Type your message here"
                className="bg-white flex-grow border rounded-md p-2"
              />

              <button
                type="submit"
                className="bg-blue-500 text-white rounded-md p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  data-slot="icon"
                  className="w-6 h-6">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </React.StrictMode>
  );
};

export default Chat;
