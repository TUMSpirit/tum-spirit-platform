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
import Timeline from "./pages/Timeline";
import Chat from "./pages/Chat";
import socketIO from "socket.io-client"

const socket = socketIO.connect("http://localhost:4000")
import React, { useState } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Navigate,
  Route,
  Link,
} from "react-router-dom";
import Cookies from "js-cookie";

const AuthApi = React.createContext();
const TokenApi = React.createContext();


function App() {
  const [auth, setAuth] = useState(false);
  const [token, setToken] = useState("");
  const readCookie = () => {
    let token = Cookies.get("token");
    if (token) {
      setAuth(true);
      setToken(token);
    }
  };
  React.useEffect(() => {
    readCookie();
  }, []);

  return (
      <>
        <AuthApi.Provider value={{ auth, setAuth }}>
          <TokenApi.Provider value={{ token, setToken }}>
            <Router>
              <div>
                <nav>
                  <ul>
                    {!auth ? (
                        <li>
                          <Link to="/register">Regsiter</Link>
                        </li>
                    ) : (
                        <></>
                    )}
                    {!auth ? (
                        <li>
                          <Link to="/login">Login</Link>
                        </li>
                    ) : (
                        <></>
                    )}
                    <li>
                      <Link to="/">Home</Link>
                    </li>
                  </ul>
                </nav>
                <Routes2/>
              </div>
            </Router>
          </TokenApi.Provider>
        </AuthApi.Provider>
      </>
  );
}
const Routes2 = () => {
  const Auth = React.useContext(AuthApi);
  return (
      <Routes>
        <Route path="/register" element = {<Register />}>

        </Route>
        <ProtectedLogin
            path="/login"
            auth={Auth.auth}
            component={Login}
        ></ProtectedLogin>
        <ProtectedRoute
            path="/"
            auth={Auth.auth}
            component={Home}
        ></ProtectedRoute>
      </Routes>
  );
};
const Home = () => {
  const [data, setData] = useState("");
  const Auth = React.useContext(AuthApi);
  const Token = React.useContext(TokenApi);
  const handleonclick = () => {
    Auth.setAuth(false);
    Cookies.remove("token");
  };
  let toke = Token.token;
  const headers = {
    Authorization: `Bearer ${toke}`,
  };
  const getdata = async () => {
    let res = await axios
        .get("http://localhost:8000/", { headers })
        .then((response) => {
          return response.data.data;
        });
    return res;
  };
  React.useEffect(async () => {
    let x = await getdata();
    setData(x);
    console.log(x);
  }, []);
  return (
      <>
        <h2>Home</h2>
        <button onClick={handleonclick}>Logout</button>
        <h1>{data}</h1>
      </>
  );
};

function Register() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = (evt) => {
    evt.preventDefault();
    const data = {
      username: name,
      company: company,
      password: password,
    };
    axios
        .post("http://localhost:8000/create", data)
        .then((response) => {
          console.log(response);
          alert(response);
        })
        .catch((error) => {
          alert(error);
        });
  };
  return (
      <>
        <form
            style={{
              marginTop: "100px",
              marginLeft: "50px",
              border: "solid 1px",
              width: "max-content",
              borderColor: "green",
            }}
            onSubmit={handleSubmit}
        >
          <div style={{ textAlign: "center" }}>Register Yourself</div>
          <br />
          <label>Username:</label>
          <input
              type="text"
              className="username"
              value={name}
              onChange={(e) => setName(e.target.value)}
          ></input>
          <br />
          <br />
          <label>Company: </label>
          <input
              type="text"
              className="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
          ></input>
          <br />
          <br />
          <label>Password: </label>
          <input
              type="password"
              className="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
          ></input>
          <br />
          <br />
          <div style={{ textAlign: "center" }}>
            <input type="submit" value="Submit" />
          </div>
        </form>
      </>
  );
}

const Login = () => {
  const Auth = React.useContext(AuthApi);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = async (evt) => {
    if (evt) {
      evt.preventDefault();
    }
    const data = {
      username: name,
      password: password,
    };
    const news = async () => {
      let res = await axios
          .post("http://localhost:8000/login", data)
          .then((response) => {
            console.log(response);
            Cookies.set("token", response.data.access_token);
            return response;
          })
          .catch((error) => {
            console.log(error.message);
          });
      return res;
    };
    let x = await news();
    if (x) {
      window.location.reload();
    }
  };
  return (
      <>
        <form
            style={{
              marginTop: "100px",
              marginLeft: "50px",
              border: "solid 1px",
              width: "max-content",
              borderColor: "green",
            }}
            onSubmit={handleSubmit}
        >
          <div style={{ textAlign: "center" }}>Login</div>
          <br />
          <label>Username:</label>
          <input
              type="text"
              className="username"
              value={name}
              onChange={(e) => setName(e.target.value)}
          ></input>
          <br />
          <br />
          <label>Password: </label>
          <input
              type="password"
              className="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
          ></input>
          <br />
          <br />
          <div style={{ textAlign: "center" }}>
            <input type="submit" value="Submit" />
          </div>
        </form>
      </>
  );
};
const ProtectedRoute = ({ auth, component: Component, ...rest }) => {
  return (
      <Route
          {...rest}
          render={() => (auth ? <Component /> : <Route to="/login" />)}
      />
  );
};
const ProtectedLogin = ({ auth, component: Component, ...rest }) => {
  return (
      <Route
          {...rest}
          render={() => (!auth ? <Component /> : <Navigate to="/" />)}
      />
  );
};
export default App;
/*
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
            <Route exact path="/timeline" component={Timeline} />

            <Redirect from="*" to="/chat" />
          </Main>
        </Switch>
      </div>
  );
}

export default App;*/