import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import "../App.css";

function NavBar() {
  const [name, setName] = useState("");

  return (
    <div>
      <h2 className="nav-header">Sessions</h2>
    </div>
  );
}

export default NavBar;
