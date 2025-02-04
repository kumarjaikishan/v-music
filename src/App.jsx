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
  const [searchinp,setsearchinp]= useState('')


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
    // console.log(e.target.value);
    audioRef.current.currentTime = e.target.value;
    audioRef.current.play();
  }

  const playpause = function () {
    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
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
  const eventdelegate = (e) => {
    if (e.target.closest('.card')?.id) {
      if (e.target.classList.contains('playbutton')) {
        setspotifysong(tracks[e.target.closest('.card').id]);
        setCurrentIndex(e.target.closest('.card').id)
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
          <audio ref={audioRef} src={''} ></audio>
          {/* <audio ref={audioRef} src={spotifysong?.url} ></audio> */}
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
      <div id="mobileplayer" >
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
          <audio ref={audioRef} src={''} ></audio>
          {/* <audio ref={audioRef} src={spotifysong?.url} ></audio> */}
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
    </>
  )
}

export default App
