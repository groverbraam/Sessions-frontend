import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import ReactPlayer from "react-player/lazy";
import "../App.css";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import Input from "@mui/material/Input";
import NavBar from "./navBar";
import Footer from "./footer";
import ReactEmoji from "react-emoji";

function Room(props) {
  const [message, setMessage] = useState("");
  const [Duration, setDuration] = useState(0);
  const [chat, setChat] = useState([]);
  const [songSubmission, setSongSubmission] = useState("");
  const [songSubmissionTitle, setSongSubmissionTitle] = useState("");
  const [songs, setSongs] = useState("");
  const [upNext, setUpNext] = useState([]);
  const [playing, setPlaying] = useState(true);
  const [played, setPlayed] = useState(0);
  const [countUsers, setCountUsers] = useState(0);
  const [mute, setMute] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState([]);

  const socketRef = useRef();
  const playerRef = useRef();
  const messagesEndRef = useRef(null);

  // console.log(props.name);
  // const socket = io("https://sessions-chat.herokuapp.com/")

  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [chat]);

  const handleSync = () => {
    socketRef.current.once(
      "syncing-audio",
      (played, songs, upNext, Duration) => {
        playerRef.current.seekTo(played, "seconds");
        setSongs(songs);
        setUpNext(upNext);
        setDuration(Duration);
        setPlaying(true);
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
    socketRef.current.emit("send-message", message, props.name);
    e.target.reset();
    setMessage("");
  };

  const onSongSubmit = (e) => {
    let soundcloud = songSubmission.startsWith("https://soundcloud.com/");
    let youtube = songSubmission.startsWith("https://www.youtube.com/");
    if (youtube === false && soundcloud === false) {
      e.preventDefault();
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
      socketRef.current.emit(
        "submit-notification",
        songSubmissionTitle,
        props.name
      );
      e.target.reset();
      // setSubmitted(true)
    }
  };

  const handleSeekChange = (e) => {
    setPlayed(e.target.value);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const renderChat = () => {
    const names = props.name;
    return chat.map((message, index) => (
      <>
        <div className="entireChat" key={index}>
          <p className="message">
            {message.name ? (
              <span>
                {message.name}: {ReactEmoji.emojify(message.message)}
              </span>
            ) : (
              <span>{ReactEmoji.emojify(message.message)}</span>
            )}
          </p>
        </div>
        <div ref={messagesEndRef}></div>
      </>
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
    socketRef.current = io("https://sessions-chat.herokuapp.com/");
    return () => socketRef.current.disconnect();
  }, []);

  useEffect(() => {
    // SEND TIME FOR SYNC
    socketRef.current.emit("sync-audio", played, songs, upNext, Duration);
  }, [played]);

  useEffect(() => {
    // CHECKS FOR SKIP
    socketRef.current.on("skip", (skip) => {
      checkEnding();
    });
  }, []);

  useEffect(() => {
    // // CHECKS FOR SKIP
    // socketRef.current.once("skip", (skip) => {
    //   checkEnding();
    // });

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
  }, [chat, songs, upNext]);

  // console.log(played)
  // console.log(submissionId)
  // console.log(submitted)

  return (
    <>
      <NavBar />
      <div className="main-container">
        <div className="user-count">
          <p>Users: {countUsers}</p>
        </div>

        {/* REACT PLAYER */}
        <div className="react-container">
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
          <Slider
            className="time-slider"
            type="range"
            min={0}
            max={Duration}
            step={20}
            value={played}
            onChange={handleSeekChange}
          />
          <Button onClick={() => handleSync()}>Sync</Button>

          <Button onClick={() => sendSkip()}>Skip</Button>
          <Button onClick={mute ? () => setMute(false) : () => setMute(true)}>
            Mute
          </Button>
        </div>

        {/*  CHAT DISPLAY */}
        <div className="sub-container">
          <div className="chat-header">
            <h3 className="chat-box-header">Chat</h3>
            <div className="chat-box">{renderChat()}</div>
            <form className="message-form" onSubmit={onMessageSubmit}>
              <br />
              <Input type="text" onChange={handleChange} required />
              <Input type="submit" />
            </form>
          </div>
          {/*  SONG SUBMISSION DISPLAY */}
          <div className="space"></div>
          <div className="queue">
            {submitted ? (
              <p>
                Submission recieved! Wait until your song is played to submit
                another!
              </p>
            ) : (
              <form className="submit-form" onSubmit={onSongSubmit}>
                <label>Song submission</label>
                <br />
                <Input
                  placeholder="Song Name"
                  className="song-name"
                  type="text"
                  onChange={handleSongSubmitTitle}
                  required
                />
                <br />
                <Input
                  placeholder="Song Link"
                  className="song-link"
                  type="text"
                  onChange={handleSongSubmit}
                  required
                />
                <Input type="submit" />
              </form>
            )}
            {/* UP NEXT DISPLAY */}
            <div>
              <h3 className="chat-box-header">Up Next:</h3>
              <div className="song-submission">
                <div className="queue-box">{renderUpNext()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Room;
