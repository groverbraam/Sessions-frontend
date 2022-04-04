import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Routes, Route, Link } from "react-router-dom";
import "../App.css";

function RoomList() {
  const [roomName, setRoomName] = useState("");
  const [showcase, setShowcase] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [rooms, setRooms] = useState([]);
  const socketRef = useRef();

  const createRoom = () => {
    setAdmin(true);
    socketRef.current.emit("create-room", (roomName, showcase, admin));
  };

  const handleRoomNameChange = (e) => {
    e.preventDefault();
    setRoomName(e.target.value);
  };

  const handleShowcase = (e) => {
    e.preventDefault();
    setShowcase(e.target.checked);
  };

  const joinRoom = () => {
    socketRef.current.emit("join-room", roomName);
  };

  const renderRoomList = () => {
    return rooms.map((room, index) => (
      <div className="roomList" key={index}>
        <p className="song">{room}</p>
        <button onClick={() => joinRoom}>Join</button>
      </div>
    ));
  };

  useEffect(() => {
    socketRef.current = io("http://localhost:3003");
    return () => socketRef.current.disconnect();
  }, []);

  useEffect(() => {
    socketRef.current.on("created-room", (roomName, showcase, admin, rooms) => {
      setRooms([...rooms, rooms]);
    });
  }, []);

  return (
    <div className="App">
      <h1>Create New Room</h1>
      <input
        placeholder="Room Name"
        type="text"
        onChange={(e) => handleRoomNameChange()}
      ></input>
      <label>Showcase</label>
      <input
        type="checkbox"
        value={true}
        onChange={(e) => handleShowcase()}
      ></input>
      <Link
        onClick={(event) => (!roomName ? event.preventDefault() : createRoom())}
        to="/room"
      >
        <button type="submit">Create</button>
      </Link>
      <Link to="/room">
        <button type="submit">Create</button>
      </Link>
      {renderRoomList()}
    </div>
  );
}

export default RoomList;
