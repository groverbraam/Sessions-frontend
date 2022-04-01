import React, { useEffect, useRef, useState } from "react"
import {io} from "socket.io-client"
import ReactPlayer from 'react-player/lazy'
import "./App.css"

function App() {

  const [message, setMessage] = useState('')
  const [Duration, setDuration] = useState(0)
	const [chat, setChat ] = useState([])
  const [songSubmission, setSongSubmission] = useState('')
  const [songSubmissionTitle, setSongSubmissionTitle] = useState('')
	const [songs, setSongs] = useState('')
  const [upNext, setUpNext] = useState([])
	const [playing, setPlaying] = useState(true)
	const [played, setPlayed] = useState(0);
  const [name, setName] = useState('')
  const [countUsers, setCountUsers] = useState(0)

  const socketRef = useRef()

  // const socket = io("http://localhost:3003")

  const checkEnding = () => {
    if (played > Duration) {
      // setPlaying(false)
      // setPlayed(0)
      // setDuration(0)
      console.log(upNext[0])
      setSongs(upNext[0].songSubmission)
      // setPlaying(true)
      setUpNext([...upNext.slice(1)])
    } else {
      // console.log('not yet...')
    }
  }



  const onDuration = (duration) => {
    // console.log(duration)
    setDuration(Math.floor(duration - 1))
  }

  const handleChange = (e) => {
		setMessage(e.target.value)
	}

  const handleSongSubmit = (e) => {
    setSongSubmission(e.target.value)
  }

  const handleSongSubmitTitle = (e) => {
    setSongSubmissionTitle(e.target.value)
  }

  const onMessageSubmit = (e) => {
    e.preventDefault()
    socketRef.current.emit('send-message', message)
    e.target.reset()
    setMessage('')
  }

  const onSongSubmit = (e) => {
    e.preventDefault()
    socketRef.current.emit('song-submit', songSubmission, songSubmissionTitle, songs)
    e.target.reset()
  }

  const handleSeekChange = e => {
    setPlayed(e.target.value)
  }

  const renderChat = () => {
		return chat.map(( message , index) => (
			<div className="entireChat" key={index}>
				<p className="message">
					{message.name ? <span><strong>{message.name} : {message.message}</strong> </span> : <span><strong>{message}</strong> </span> }
				</p>
			</div>
		))
	}

  const renderUpNext = () => {
		return upNext.map(( song , index) => (
			<div className="entireUpnext" key={index}>
				<p className="song">
					{song.title}
				</p>
			</div>
		))
	}

      useEffect(
            () => {
              socketRef.current = io("http://localhost:3003")

              return () => socketRef.current.disconnect()
            },
            []
            )

     useEffect(() => {

      //  STORES MESSAGES IN THE CHAT 
          socketRef.current.once("receive-message", (message, name) => {
            setChat([ ...chat, {message: message, name: name}])
          })

        // SENDS JOIN MESSAGE
          socketRef.current.once('join-message', message => {
            setChat([ ...chat, message])
           })

        // SENDS THE LEAVE MESSAGE
          socketRef.current.once('leave-message', message => {
            setChat([ ...chat, message])
           })

        // SETS THE NUMBER OF USERS WHEN SOMEONE LEAVES
           socketRef.current.on('leave-message-2', number => {
             const test = parseInt(number)
            setCountUsers(countUsers - 1)
           })

        // SETS THE NUMBER OF USERS
          socketRef.current.on('user-count', number => {
            setCountUsers(number)
           })

        // SENDS THE SONGS
          socketRef.current.once("song-recieved", (songSubmission, songSubmissionTitle, song, name) => {
            if (songs === '') {
              song ? setSongs(song) : setSongs(songSubmission)
            } else {
              setUpNext([ ...upNext, {songSubmission: songSubmission, title: songSubmissionTitle, currently: song, id: name}])
            }
          })
    },[chat, songs, songSubmission, songSubmissionTitle, upNext])

 
          console.log(Duration)
          console.log(played)
      

  return (
    <div className="Main-container">
      <p>Users: {countUsers}</p>
     
      {/* REACT PLAYER */}
      <ReactPlayer
					className='react-player'
					url={songs}
					playing={playing}
					autoPlay={true}
					// style= {{pointerEvents: "none"}}
					config={{ youtube: {playerVars: { modestbranding: 1, disablekb: 1} }, soundcloud: {options: {sharing: false, download: false, show_artwork: false, show_playcount: false}}}}
					vimeoconfig={{ iframeParams: { fullscreen: 0 } }}
					onReady={() =>{setPlaying(true)}}
					onDuration={onDuration}
					onProgress={(progress) => {
						setPlayed(Math.floor(progress.playedSeconds + 2));
						}}
          onSeek={e => console.log('onSeek', e)}
					onEnded={checkEnding()}
					/>

          {/* SLIDER DISPLAY SHOWING REMAINING TIME */}
          <input type='range' min={0} max={Duration} step='any' value={played} onChange={handleSeekChange}/>


        {/*  CHAT DISPLAY */}
      <form onSubmit={onMessageSubmit}>
        <label>Chat</label>
        <br/>
        {renderChat()}
		        <input type='text' onChange={handleChange} required/>
		        <input type="submit" />
		      </form>

        {/*  SONG SUBMISSION DISPLAY */}
          <form onSubmit={onSongSubmit}>
            <label>Song Submission</label>
            <br/>
            <label>Song Name</label>
              <input type='text' onChange={handleSongSubmitTitle}/>
            <br/>
            <label>Song Link</label>
              <input type='text' onChange={handleSongSubmit}/>
              <br/>
              <input type="submit" />
		      </form>

          {/* UP NEXT DISPLAY */}
          <label>Up Next:</label>
          {renderUpNext()}
          
    </div>
  );
}

export default App;
