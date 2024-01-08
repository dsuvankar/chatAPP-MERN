import axios from "axios";

import { UserContext, UserContextProvider } from "./UserContext";

import Routes from "./Routes";

function App() {
  axios.defaults.baseURL = "http://localhost:4000";
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
