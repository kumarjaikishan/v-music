import { useEffect, useState, useRef } from 'react'
import './App.css'
import { FaChevronLeft, FaBackward, FaForward, FaPause, FaPlay, FaSearch } from "react-icons/fa";
import { MdMenu } from "react-icons/md";
import { FaMusic } from "react-icons/fa6";
import songlist from './musiclist.json'

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [duration, setDuration] = useState("0:00");
  const [spotifysong, setspotifysong] = useState({})
  const [currentsongtimne, setcurrentsongtimne] = useState("0:00");
  const audioRef = useRef(null);
  const [searched, setsearched] = useState([])
  const [tracks, settracks] = useState(songlist)
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchinp, setsearchinp] = useState('')


  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => setIsPlaying(false);

      audio.addEventListener("play", handlePlay);
      audio.addEventListener("pause", handlePause);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, []);

  useEffect(() => {
    if (audioRef.current && spotifysong?.url) {
      audioRef.current.src = spotifysong.url;
      audioRef.current.load(); // Ensure the new song is loaded
      audioRef.current.play().catch((err) => console.log("Autoplay blocked", err));
      audioRef.current.volume = 0.3;
    }
  }, [spotifysong]);



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
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onloadedmetadata = () => {
        const totalSeconds = Math.floor(audioRef.current.duration);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        setDuration(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      };
    }
  }, []);



  const handleChange = (e) => {
    audioRef.current.currentTime = e.target.value;
    audioRef.current.play();
  }

  const playpause = function () {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => console.log("autoplay bolcked:", err));
      }
    }
  }

  const nextsong = () => {
    let nextindex = currentIndex >= (tracks.length - 1) ? 0 : currentIndex + 1;
    setspotifysong(tracks[nextindex])
    setCurrentIndex(nextindex)
  }

  const prevsong = () => {
    let previndex = currentIndex <= 0 ? tracks.length - 1 : currentIndex - 1
    setspotifysong(tracks[previndex])
    setCurrentIndex(previndex)
  }

  const eventdelegate = (e) => {
    if (e.target.closest('.card')?.id) {
      if (e.target.classList.contains('playbutton')) {
        setspotifysong(tracks[e.target.closest('.card').id]);
        setCurrentIndex(parseInt(e.target.closest('.card').id))
        // playpause()
        if (currentIndex === e.target.closest('.card')?.id) playpause();
      }
    }
  }
  function debouncing(func, delay) {
    let timer;

    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args)
      }, delay);
    }
  }
  const debouncedsearch = debouncing((keyword) => {
    const searchedsong = tracks.filter((val) =>
      val.songname.toLowerCase().includes(keyword)
    );
    setsearched(searchedsong)
  }, 1100)
  const serchcall = (e) => {
    setsearchinp(e.target.value)
    const keyword = e.target.value.toLowerCase();
    debouncedsearch(keyword)
  }

  return (
    <>
      <div className="navbar">
        <span>  V-Music <FaMusic /> </span>
        <div className="search" >
          <input type="text" onChange={serchcall} value={searchinp} placeholder='Search Song...' />
          <ul>
            {searched?.map((val, ind) => {
              return <li key={ind} onClick={() => {
                setspotifysong(ind);
                setCurrentIndex(ind);
                setsearched([]);
                setsearchinp('')
              }}>
                <img src={val.image} alt="Song Image" />
                <span>{val.songname}</span>
              </li>
            })}
          </ul>
        </div>
      </div>
      <div className="container">
        <div className="tracklist" onClick={eventdelegate}>
          {tracks?.map((val, ind) => {
            return <div key={val.id} className={currentIndex == ind ? "card playing" : 'card'} id={ind} >
              <div className="playbutton" title='Play Now'> {(currentIndex == ind && isPlaying) ? <FaPause /> : <FaPlay />}   </div>
              <img src={val.image} alt="" />
              <p>{val.songname}</p>
              <p className='artist'>Artist: {val.artist} </p>
            </div>
          })}
        </div>

        <div id="player" >
          <nav>
            <div className="ico"> <FaChevronLeft /> </div>
            <div className="ico"> <MdMenu /> </div>
          </nav>
          <div className={isPlaying ? "image  playing" : "image"}>
            <img src={spotifysong?.image} alt="" />
          </div>
          <header className='header'>
            <h2>{spotifysong?.songname || "name"} </h2>
            <p>{spotifysong?.artist || "Artist🎨"}</p>
          </header>

          {/* <audio ref={audioRef} src={''} ></audio> */}
          <audio ref={audioRef} ></audio>
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
            <div className="ico" onClick={playpause}>{isPlaying ? <FaPause /> : <FaPlay />} </div>
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
      <footer id="mobileplayer" >
        <div className="formobile">
          <div className="image">
            <img src={spotifysong?.image} alt="" />
          </div>
          <header className='header'>
            <h2>{spotifysong?.songname || "name"} </h2>
            <p>{spotifysong?.artist || "Artist🎨"} </p>
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
        <audio ref={audioRef}></audio>
        <div id="controls">
          <div className="ico" onClick={prevsong}><FaBackward /> </div>
          <div className="ico" onClick={playpause}>{isPlaying ? <FaPause /> : <FaPlay />} </div>
          <div className="ico" onClick={nextsong}><FaForward /> </div>
        </div>
      </footer>
    </>
  )
}

export default App
