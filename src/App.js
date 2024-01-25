import {Route, Switch, Redirect} from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Main from "./components/layout/Main";
import "antd/dist/reset.css";
import "./assets/styles/main.css";
import "./assets/styles/responsive.css";
import Kanban from "./pages/Kanban";
import Team from "./pages/Team";
import Documents from "./pages/Documents";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Chat from "./pages/Chat";
import socketIO from "socket.io-client"

const socket = socketIO.connect("http://localhost:4000")


function App() {
  return (
    <div className="App">
      <Switch>
        <Route path="/" exact component={SignIn} />
        <Main>
          <Route exact path="/calendar" component={Calendar} />
          <Route path="/chat" component={Chat}></Route>
          <Route exact path="/kanban" component={Kanban} />
          <Route exact path="/team" component={Team} />
          <Route exact path="/documents" component={Documents} />
          <Route exact path="/dashboard" component={Dashboard} />

          <Redirect from="*" to="/kanban" />
        </Main>
      </Switch>
    </div>
  );
}

export default App;
