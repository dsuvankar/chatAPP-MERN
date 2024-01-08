import axios from "axios";

import { UserContextProvider } from "./UserContext";

import Routes from "./Routes";

function App() {
  axios.defaults.baseURL = "https://chat-app-mern-z8g7.vercel.app";
  axios.defaults.withCredentials = true;

  return (
    <div className="">
      <UserContextProvider>
        <Routes />
      </UserContextProvider>
    </div>
  );
}

export default App;
