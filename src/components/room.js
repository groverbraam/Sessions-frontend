import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import ReactPlayer from "react-player/lazy";
import "../App.css";

function Room() {
  const [message, setMessage] = useState("");
  const [Duration, setDuration] = useState(0);
  const [chat, setChat] = useState([]);
  const [songSubmission, setSongSubmission] = useState("");
  const [songSubmissionTitle, setSongSubmissionTitle] = useState("");
  const [songs, setSongs] = useState("");
  const [upNext, setUpNext] = useState([]);
  const [playing, setPlaying] = useState(true);
  const [played, setPlayed] = useState(0);
  const [name, setName] = useState("");
  const [countUsers, setCountUsers] = useState(0);
  const [mute, setMute] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState([]);

  const socketRef = useRef();
  const playerRef = useRef();

  // const socket = io("http://localhost:3003")

  const handleSync = () => {
    socketRef.current.once(
      "syncing-audio",
      (played, songs, upNext, Duration) => {
        playerRef.current.seekTo(played, "seconds");
        setSongs(songs);
        setUpNext(upNext);
        setDuration(Duration);
      }
    );
  };

  const checkEnding = () => {
    setSongs(upNext[0].submittedSong);
    setUpNext([...upNext.slice(1)]);
    // setSubmissionId([...submissionId.slice(1)]);
    // checkSubmission()
  };

  ////TRYING TO FIGURE OUT HOW TO ONLY SUBMIT ONE AT A TIME
  // const checkSubmission = () => {
  //    console.log(typeof(upNext[0].id))
  //    const test = upNext[0].id
  //   if (submissionId.includes(test)) {
  //     // setSubmitted(true)
  //     console.log('still in queue')
  //   } else {
  //     setSubmitted(false)
  //     console.log('not in queue')
  //   }
  // }

  // console.log(submissionId)
  const sendSkip = () => {
    socketRef.current.emit("send-skip");
  };

  const onDuration = (duration) => {
    setDuration(Math.floor(duration - 1));
  };

  const handleChange = (e) => {
    e.preventDefault();
    setMessage(e.target.value);
  };

  const handleSongSubmit = (e) => {
    e.preventDefault();
    setSongSubmission(e.target.value);
  };

  const handleSongSubmitTitle = (e) => {
    e.preventDefault();
    setSongSubmissionTitle(e.target.value);
  };

  const onMessageSubmit = (e) => {
    e.preventDefault();
    socketRef.current.emit("send-message", message);
    e.target.reset();
    setMessage("");
  };

  const onSongSubmit = (e) => {
    let soundcloud = songSubmission.startsWith("https://soundcloud.com/");
    let youtube = songSubmission.startsWith("https://www.youtube.com/");
    if (youtube === false && soundcloud === false) {
      alert("Please submit an YouTube/Soundcloud link.");
      e.target.reset();
    } else {
      e.preventDefault();
      socketRef.current.emit(
        "song-submit",
        songSubmission,
        songSubmissionTitle,
        songs
      );
      socketRef.current.emit("submit-notification", songSubmissionTitle);
      e.target.reset();
      // setSubmitted(true)
    }
  };

  const handleSeekChange = (e) => {
    setPlayed(e.target.value);
  };

  const renderChat = () => {
    return chat.map((message, index) => (
      <div className="entireChat" key={index}>
        <p className="message">
          {message.name ? (
            <span>
              <strong>
                {message.name} : {message.message}
              </strong>
            </span>
          ) : (
            <span>
              <strong>{message}</strong>
            </span>
          )}
        </p>
      </div>
    ));
  };

  const renderUpNext = () => {
    return upNext.map((song, index) => (
      <div className="entireUpnext" key={index}>
        <p className="song">{song.title}</p>
      </div>
    ));
  };

  useEffect(() => {
    socketRef.current = io("http://localhost:3003");
    return () => socketRef.current.disconnect();
  }, []);

  useEffect(() => {
    // SEND TIME FOR SYNC
    socketRef.current.emit("sync-audio", played, songs, upNext, Duration);

    // CHECKS FOR SKIP
    socketRef.current.on("skip", (skip) => {
      checkEnding();
    });

    //  STORES MESSAGES IN THE CHAT
    socketRef.current.once("receive-message", (message, name) => {
      setChat([...chat, { message: message, name: name }]);
    });

    // SENDS JOIN MESSAGE
    socketRef.current.once("join-message", (message) => {
      setChat([...chat, message]);
    });

    // SENDS THE LEAVE MESSAGE
    socketRef.current.once("leave-message", (message) => {
      setChat([...chat, message]);
    });

    // SETS THE NUMBER OF USERS WHEN SOMEONE LEAVES
    socketRef.current.on("leave-message-2", (number) => {
      const test = parseInt(number);
      setCountUsers(countUsers - 1);
    });

    // SETS THE NUMBER OF USERS
    socketRef.current.on("user-count", (number) => {
      setCountUsers(number);
    });

    // SENDS THE SONGS
    socketRef.current.on(
      "song-recieved",
      (songSubmission, songSubmissionTitle, song, name) => {
        if (songs === "") {
          song ? setSongs(song) : setSongs(songSubmission);
        } else {
          setUpNext([
            ...upNext,
            {
              submittedSong: songSubmission,
              title: songSubmissionTitle,
              currentSong: song,
              id: name,
            },
          ]);
          setSubmissionId([...submissionId, name]);
        }
      }
    );

    // SENDS THE SONGS NOTIFICATION
    socketRef.current.on("send-notification", (message) => {
      setChat([...chat, message]);
    });
  }, [chat, played]);

  // console.log(played)
  // console.log(submissionId)
  // console.log(submitted)

  return (
    <div className="Main-container">
      <p>Users: {countUsers}</p>

      {/* REACT PLAYER */}
      <ReactPlayer
        className="react-player"
        ref={playerRef}
        url={songs}
        playing={playing}
        autoPlay={true}
        muted={mute}
        style={{ pointerEvents: "none" }}
        config={{
          youtube: { playerVars: { modestbranding: 1, disablekb: 1 } },
          soundcloud: {
            options: {
              sharing: false,
              download: false,
              show_artwork: false,
              show_playcount: false,
              single_active: false,
            },
          },
        }}
        vimeoconfig={{ iframeParams: { fullscreen: 0 } }}
        onReady={() => {
          setPlaying(true);
        }}
        onDuration={(duration) => {
          setDuration(Math.floor(duration));
        }}
        onProgress={(progress) => {
          setPlayed(Math.floor(progress.playedSeconds));
        }}
        onSeek={(e) => ("onSeek", e)}
        onEnded={() => checkEnding()}
      />

      {/* SLIDER DISPLAY SHOWING REMAINING TIME */}
      <input
        type="range"
        min={0}
        max={Duration}
        step="any"
        value={played}
        onChange={handleSeekChange}
      />
      <button onClick={() => handleSync()}>Sync</button>

      <button onClick={() => sendSkip()}>Skip</button>
      <button onClick={mute ? () => setMute(false) : () => setMute(true)}>
        Mute
      </button>

      {/*  CHAT DISPLAY */}
      <form onSubmit={onMessageSubmit}>
        <label>Chat</label>
        <br />
        {renderChat()}
        <input type="text" onChange={handleChange} required />
        <input type="submit" />
      </form>

      {/*  SONG SUBMISSION DISPLAY */}
      {submitted ? (
        <p>
          Submission recieved! Wait until your song is played to submit another!
        </p>
      ) : (
        <form onSubmit={onSongSubmit}>
          <label>Song Submission</label>
          <br />
          <label>Song Name</label>
          <input type="text" onChange={handleSongSubmitTitle} required />
          <br />
          <label>Song Link</label>
          <input type="text" onChange={handleSongSubmit} required />
          <br />
          <input type="submit" />
        </form>
      )}

      {/* UP NEXT DISPLAY */}
      <label>Up Next:</label>
      {renderUpNext()}
    </div>
  );
}

export default Room;
