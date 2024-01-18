import React, {useState} from 'react'
import {useNavigate} from "react-router-dom"

const Home = ({socket}) => {
    const navigate = useNavigate()
    const [userName, setUserName] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault()
        const botUserName = 'Martin';
        localStorage.setItem("userName", userName)
        socket.emit("newUser", {userName, socketID: socket.id})

        if (!localStorage.getItem(botUserName)) {
            localStorage.setItem('botUserName', botUserName);
            socket.emit('newUser', {userName: botUserName, socketID: socket.id});
        }
        navigate("/chat")
    }

    return (
        <form className='home__container' onSubmit={handleSubmit}>
            <h2 className='home__header'>Sign in to Open TUMSpirit Chat</h2>
            <label htmlFor="username">Username</label>
            <input type="text"
                   minLength={4}
                   name="username"
                   id='username'
                   className='username__input'
                   value={userName}
                   onChange={e => setUserName(e.target.value)}
            />
            <button className='home__cta'>SIGN IN</button>
        </form>
    )
}

export default Home