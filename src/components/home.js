import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import "../App.css";

function Home() {
  const [name, setName] = useState("");

  return (
    <div className="joinOuterContainer">
      <div className="joinInnerContainer">
        <h1 className="heading">Sessions</h1>
        <div>
          <input
            placeholder="Username"
            className="joinInput"
            type="text"
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <Link onClick={(e) => (!name ? e.preventDefault() : null)} to="/rooms">
          <button className={"button mt-20"} type="submit">
            Create User
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
