import {BrowserRouter, Route} from "react-router-dom"
import ChatPage from "./components/ChatPage";
import socketIO from "socket.io-client"

const socket = socketIO.connect("http://localhost:4000")
function App() {
    return (
        <BrowserRouter>
            <div>
                    <Route path="/chat" element={<ChatPage socket={socket}/>}></Route>
            </div>
        </BrowserRouter>

    );
}

export default App;