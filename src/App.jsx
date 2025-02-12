import { useEffect, useState, useRef, useCallback } from 'react'
import './App.css'
import { FaChevronLeft, FaBackward, FaForward, FaPause, FaPlay, FaVolumeMute } from "react-icons/fa";
import { MdMenu } from "react-icons/md";
import { FaMusic, FaShuffle, FaVolumeLow } from "react-icons/fa6";
import songlist from './musiclist.json'

let timer;

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [duration, setDuration] = useState("0:00");
  const [spotifysong, setspotifysong] = useState({})
  const [currentsongtimne, setcurrentsongtimne] = useState("0:00");
  const audioRef = useRef(null);
  const playerRef = useRef(null);
  const [searched, setsearched] = useState([])
  const [tracks, settracks] = useState(songlist)
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchinp, setsearchinp] = useState('');
  const [shuffle, setsuffle] = useState(false)
  const [volume, setvolume] = useState(4);
  const [tempvol, settempvol] = useState(0);
  const [ismute, setismute] = useState(false)


  useEffect(() => {
    if (songlist.length) setspotifysong(songlist[0]);

    if (audioRef.current) {
      const audio = audioRef.current;

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => {
        setIsPlaying(false);
        nextsong();
      };
      const handleVolumeChange = () => {
        console.log("Volume changed:", audio.volume);
        setvolume(audio.volume * 10);
      };

      const keyboard = (e) => {
        const activeElement = document.activeElement;
        if (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA") {
          return;
        }
        if (e.key === " ") {
          e.preventDefault();
          if (audio.paused) {
            audio.play();
          } else {
            audio.pause();
          }
        }
        if (e.key === "ArrowRight") {
          audio.currentTime += 20;
        }
        if (e.key === "ArrowLeft") {
          audio.currentTime -= 20;
        }
        if (e.key === "ArrowUp") {
          audio.volume = Math.min(audio.volume + 0.1, 1);
        }
        if (e.key === "ArrowDown") {
          audio.volume = Math.max(audio.volume - 0.1, 0);
        }
      };

      // Attach audio event listeners
      audio.addEventListener("play", handlePlay);
      audio.addEventListener("pause", handlePause);
      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("volumechange", handleVolumeChange);

      // Attach keyboard event listener to document instead of playerRef
      document.addEventListener("keydown", keyboard);

      // Cleanup function
      return () => {
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("volumechange", handleVolumeChange);

        document.removeEventListener("keydown", keyboard);
      };
    }
  }, []);




  useEffect(() => {
    if (audioRef.current && spotifysong?.url) {
      audioRef.current.src = spotifysong.url;
      audioRef.current.load(); // Ensure the new song is loaded
      audioRef.current.play().catch((err) => console.log("Autoplay blocked", err));
      audioRef.current.volume = 0.4;
    }
  }, [spotifysong]);
  useEffect(() => {
    console.log(searched)
  }, [searched]);


  useEffect(() => {
    if (ismute) {
      audioRef.current.volume = 0;
      settempvol(volume)
      setvolume(0)
    } else {
      console.log(tempvol)
      audioRef.current.volume = tempvol / 10;
      setvolume(tempvol)
      settempvol(null)
    }

  }, [ismute]);



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

  const handlevol = (e) => {
    // console.log(e.target.value)
    audioRef.current.volume = e.target.value / 10;
    setvolume(e.target.value);
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
    let nextindex;
    if (shuffle) {
      nextindex = Math.floor(Math.random() * tracks.length)
    } else {
      nextindex = currentIndex >= (tracks.length - 1) ? 0 : currentIndex + 1;
    }
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


  function debouncing(keyword, delay) {

    function calee() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        console.log("Debounced Search Triggered"); // Debugging
        if (keyword === "") {
          return setsearched([]);
        }

        let hello = tracks.map((val, ind) => {
          if (val.songname.toLowerCase().includes(keyword)) {
            return { ...val, indexe: ind };
          }
          return null;
        }).filter(Boolean);
        if (!hello.length) {
          hello = [{
            songname: "No Result Found"
          }]
        }
        console.log(hello)
        setsearched(hello);
      }, delay);
    };
    calee();
  }


  const serchcall = (e) => {
    setsearchinp(e.target.value);
    const keyword = e.target.value.trim().toLowerCase();
    debouncing(keyword, 1200);
  };

  const searchedlistclicked = (e) => {
    if(!e.indexe) return
    // console.log(e.indexe)
    setspotifysong(e);
    setCurrentIndex(e.indexe);
    setsearched([]);
    setsearchinp('')
  }

  return (
    <>
      <div className="navbar">
        <span> <FaMusic /> V-Music  </span>
        <div className="search" >
          <input type="text" onChange={serchcall} onBlur={()=> !searched[0].indexe && setsearched([])} value={searchinp} placeholder='Search Song...' />
          <ul>
            {searched?.map((val, ind) => {
              return <li key={ind} onClick={() => searchedlistclicked(val)}>
                {val.image && <img src={val.image} alt="Song Image" />}
                <span>{val?.songname}</span>
              </li>
            })}
          </ul>
        </div>
      </div>
      <div className="container">
        <div className="tracklist" onClick={eventdelegate}>
          {tracks?.map((val, ind) => {
            return <div key={val.id} className={currentIndex == ind ? "card playing" : 'card'} id={ind} >
              <div className="playbutton" onClick={playpause} title={(currentIndex == ind && isPlaying) ? 'Pause':'Play Now'}> {(currentIndex == ind && isPlaying) ? <FaPause /> : <FaPlay />}   </div>
              <img src={val.image} alt="" />
              <p>{val.songname}</p>
              <p className='artist'>Artist: {val.artist} </p>
              <div className="waves">
                {isPlaying && <>
                  <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                </>}
              </div>
            </div>
          })}
        </div>
        <div id="player" ref={playerRef} >
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
          <div id="controls" className='main'>
            <span className={shuffle ? 'shuffle active' : 'shuffle'} onClick={() => setsuffle(!shuffle)}><FaShuffle /></span>
            <div className="ico" onClick={prevsong}><FaBackward /> </div>
            <div className="ico playpause" onClick={playpause}>{isPlaying ? <FaPause /> : <FaPlay />} </div>
            <div className="ico" onClick={nextsong}><FaForward /> </div>
            <span className='vol'>
              {ismute ? <FaVolumeMute onClick={() => setismute(!ismute)} /> :
                <FaVolumeLow className='volup' onClick={() => setismute(!ismute)} />}
              <input
                type="range"
                value={volume}
                onChange={handlevol}
                max={10}
                id="vol"
              />
            </span>
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
          <div className={isPlaying ? "image  playing" : "image"}>
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
          <div className="ico playpause" onClick={playpause}>{isPlaying ? <FaPause /> : <FaPlay />} </div>
          <div className="ico" onClick={nextsong}><FaForward /> </div>
          <span className={shuffle ? 'shuffle active' : 'shuffle'} onClick={() => setsuffle(!shuffle)}><FaShuffle /></span>
          <span className='vol' >
            {ismute ? <FaVolumeMute onClick={() => setismute(!ismute)} /> : <FaVolumeLow onClick={() => setismute(!ismute)} className='volup' />}
            <input
              type="range"
              value={volume}
              onChange={handlevol}
              max={10}
              id="vol"
            />
          </span>
        </div>
      </footer>
    </>
  )
}

export default App
