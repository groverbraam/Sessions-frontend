import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import ReactPlayer from "react-player/lazy";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Room from "./components/room";
import Home from "./components/home";
import RoomList from "./components/roomList";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" exact element={<Home />} />
        <Route path="/rooms" element={<RoomList />} />
        <Route path="/room" element={<Room />} />
      </Routes>
    </div>
  );
}

export default App;
