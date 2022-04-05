import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import "../App.css";
import { ListItemButton, ListItemText } from "@mui/material";

function Footer() {
  return (
    <div>
      <nav className="footer">
        <ListItemButton href="https://github.com/groverbraam">
          <ListItemText primary="Github" />
        </ListItemButton>
        <ListItemButton href="https://www.linkedin.com/in/christophermaleakethompson/">
          <ListItemText primary="LinkedIn" />
        </ListItemButton>
      </nav>
    </div>
  );
}

export default Footer;
