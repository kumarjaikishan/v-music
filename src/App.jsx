import { useEffect, useState, useRef } from 'react'
import './App.css'
import { FaChevronLeft, FaBackward, FaForward, FaPause, FaPlay, FaSearch } from "react-icons/fa";
import { MdMenu } from "react-icons/md";
import { FaMusic } from "react-icons/fa6";
import songlist from './musiclist.json'

function App() {
  const [currentsong, setcurrentsong] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [duration, setDuration] = useState("0:00");
  const [spotifysong, setspotifysong] = useState({})
  const [search, setsearch] = useState('bulbula')
  const [currentsongtimne, setcurrentsongtimne] = useState("0:00");
  const audioRef = useRef(null);
  const [tracks, settracks] = useState(songlist)


  const firste = async () => {
    try {
      // let res = await fetch('https://v1.nocodeapi.com/kumarjai/spotify/IbIBTKsrfdicMJoB/search?q=bulbula&type=track');
      let res = await fetch(`https://v1.nocodeapi.com/kumarjai/spotify/IbIBTKsrfdicMJoB/search?q=${search}&type=track`);

      let data = await res.json();
      console.log(data)
      settracks(data.tracks.items);
      setspotifysong(data?.tracks?.items[0]);

    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    // firste();
    console.log(songlist)
  }, [])

  useEffect(() => {
    //  console.log(spotifysong)
    audioRef.current.play();
    audioRef.current.volume = 0.2;
  }, [spotifysong])


  useEffect(() => {
    const updateTime = () => {
      if (audioRef.current && !audioRef.current.paused) {
        const seconds = Math.floor(audioRef.current.currentTime);
        const minutes = Math.floor(seconds / 60);
        const formattedSeconds = (seconds % 60).toString().padStart(2, "0");
        setcurrentsongtimne(`${minutes}:${formattedSeconds}`);
      }
    };

    const interval = setInterval(updateTime, 500); // Update every second

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [currentsong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onloadedmetadata = () => {
        const totalSeconds = Math.floor(audioRef.current.duration);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        setDuration(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      };
    }
  }, [currentsong]);



  const handleChange = (e) => {
    // console.log(e.target.value);
    audioRef.current.currentTime = e.target.value;
    audioRef.current.play();
    setsongplaying(true)
  }

  const playpause = function () {

    // console.log(audioRef.current.currentTime)
    // console.log(audioRef.current.duration)
    if (audioRef.current.paused) {
      audioRef.current.play();
      setsongplaying(true)
    } else {
      audioRef.current.pause();
      setsongplaying(false)
    }
  }

  const nextsong = () => {
    if (currentIndex >= tracks.length - 1) {
      setspotifysong(tracks[0])
      setCurrentIndex(0)
    } else {
      setspotifysong(tracks[currentIndex + 1])
      setCurrentIndex((prev) => prev + 1)
    }
  }
  const prevsong = () => {
    if (currentIndex <= 0) {
      setspotifysong(tracks.length - 1)
      setCurrentIndex(tracks.length - 1)
    } else {
      setspotifysong(tracks[currentIndex - 1])
      setCurrentIndex((prev) => prev - 1)
    }
  }

  return (
    <>
      <div className="navbar">
        <span>  V-Music <FaMusic /> </span>
        <div className="search" >
          <input type="text" onChange={(e) => setsearch(e.target.value)} placeholder='Search Song...' />
          <FaSearch onClick={firste} />
        </div>
      </div>
      <div className="container">
        <div className="tracklist">
          {tracks?.map((val, ind) => {
            return <div key={val.id} className='card' >
              <div className="playbutton" onClick={() => { setspotifysong(val); setCurrentIndex(ind) }} title='Play Now'><FaPlay />  </div>
              <img src={val.image} alt="" />
              <p>{val.songname}</p>
              <p className='artist'>Artist: {val.artist} </p>
              {/* <audio src={val.preview_url} controls></audio> */}
            </div>
          })}
          {tracks?.map((val, ind) => {
            return <div key={val.id} className='card' >
              <div className="playbutton" onClick={() => { setspotifysong(val); setCurrentIndex(ind) }} title='Play Now'><FaPlay />  </div>
              <img src={val.image} alt="" />
              <p>{val.songname}</p>
              <p className='artist'>Artist: {val.artist} </p>
              {/* <audio src={val.preview_url} controls></audio> */}
            </div>
          })}
        </div>
        <div id="player" >
          <nav>
            <div className="ico"> <FaChevronLeft /> </div>
            <div className="ico"> <MdMenu /> </div>
          </nav>
          <div className="image">
            <img src={spotifysong?.image} alt="" />
          </div>
          <header className='header'>
            <h2>{spotifysong?.songname || "name"} </h2>
            <p>{spotifysong?.artist || "Artist🎨"}</p>
          </header>
          <div className="formobile">
            <div className="image">
              <img src={spotifysong?.image} alt="" />
            </div>
            <header className='header'>
              <h2>{spotifysong?.songname || "name"} </h2>
              <p>{spotifysong?.artist || "Artist🎨"}</p>
            </header>
          </div>
          <div className="mobilecontrols">
            <div className="start">{currentsongtimne}</div>
            <input
              type="range"
              onChange={handleChange}
              value={Math.floor(audioRef?.current?.currentTime) || 0}
              max={Math.floor(audioRef?.current?.duration) || 100}
              id="progress"
            />
            <div className="end">{duration}</div>
          </div>
          <audio ref={audioRef} src={spotifysong?.url} ></audio>
          <div id="songlength">
            <div className="timer">
              <div className="start">{currentsongtimne}</div>
              <div className="end">{duration}</div>
            </div>
            <input
              type="range"
              onChange={handleChange}
              value={Math.floor(audioRef?.current?.currentTime) || 0}
              max={Math.floor(audioRef?.current?.duration) || 100}
              id="progress"
            />
          </div>
          <div id="controls">
            <div className="ico" onClick={prevsong}><FaBackward /> </div>
            <div className="ico" onClick={playpause}>{audioRef?.current?.paused ? <FaPlay /> : <FaPause />} </div>
            <div className="ico" onClick={nextsong}><FaForward /> </div>
          </div>

          <div
            id="back"
            style={{
              backgroundImage: `url(${spotifysong?.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }} >  </div>
        </div>
      </div>
    </>
  )
}

export default App
