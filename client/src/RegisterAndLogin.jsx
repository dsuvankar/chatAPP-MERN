import axios from "axios";
import React, { useContext, useState } from "react";
import { UserContext } from "./UserContext";

const RegisterAndLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("login");
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

  async function handleSubmit(e) {
    e.preventDefault();
    const url = isLoginOrRegister === "register" ? "register" : "login";
    const { data } = await axios.post(url, { username, password });
    setLoggedInUsername(username);
    setId(data.id);
  }

  return (
    <React.StrictMode>
      <div className="bg-blue-50 h-screen flex items-center">
        <form className="w-64 mx-auto mb-12 " onSubmit={handleSubmit}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="userName"
            className="block w-full rounded-sm p-2 mb-2 border"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="password"
            className="block w-full rounded-sm p-2 mb-2 border"
          />
          <button className="bg-blue-500 text-white block w-full rounded-md p-2">
            {isLoginOrRegister === "register" ? "Register" : "Login"}
          </button>
          <div className="text-center mt-1">
            {isLoginOrRegister === "register" ? (
              <div className="">
                Already a Member?{" "}
                <button
                  className="font-bold"
                  onClick={() => setIsLoginOrRegister("login")}>
                  Login here
                </button>{" "}
              </div>
            ) : (
              <div>
                <span>Don&apos;t have account?</span>{" "}
                <button
                  className="font-bold "
                  onClick={() => setIsLoginOrRegister("register")}>
                  Register here
                </button>{" "}
              </div>
            )}
          </div>
        </form>
      </div>
    </React.StrictMode>
  );
};
export default RegisterAndLogin;
