import { useContext } from "react";
import RegisterAndLogin from "./RegisterAndLogin";
import { UserContext } from "./UserContext";
import Chat from "./Chat.jsx";

export default function Routes() {
  const { username } = useContext(UserContext);

  if (username) {
    return <Chat />;
  }
  return <RegisterAndLogin />;
}
