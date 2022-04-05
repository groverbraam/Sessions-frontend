import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

function Home(props) {
  //   const handleNameSubmit = (e) => {
  //     e.preventDefault();
  //     setName(e.target.value);
  //   };
  return (
    <div className="joinOuterContainer">
      <div className="joinInnerContainer">
        <h1 className="heading">Sessions</h1>
        <div>
          <input
            placeholder="Username"
            className="joinInput"
            type="text"
            onChange={(e) => props.handleNameSubmit(e)}
          />
        </div>
        <Link
          onClick={(e) =>
            !props.name ? e.preventDefault() : props.submitName()
          }
          to="/room"
        >
          <button className={"button mt-20"} type="submit">
            Create User
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
