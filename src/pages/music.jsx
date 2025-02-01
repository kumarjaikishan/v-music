import { useEffect, useState, useRef } from 'react'
import './music.css'
import { FaChevronLeft } from "react-icons/fa";
import { MdMenu } from "react-icons/md";
import { FaBackward } from "react-icons/fa";
import { FaForward } from "react-icons/fa";
import { FaPause } from "react-icons/fa";
import { FaPlay } from "react-icons/fa";

const Music = () => {
      const [currentsongindex, setcurrentsongindex] = useState(0);
       const [currentsong, setcurrentsong] = useState({});
       const [songplaying, setsongplaying] = useState(false);
       const [duration, setDuration] = useState("0:00");
       const [currentsongtimne, setcurrentsongtimne] = useState("0:00");
       const audioRef = useRef(null);
       const songList = [
         {
           songName: '128-Aaj Ki Raat - Stree 2 128 Kbps',
           artist: 'Honey kumar',
           thumbnail: 'download1.jpeg'
         },
         {
           songName: '128-Bhool Bhulaiyaa 3 - Title Track (Feat. Pitbull) - Bhool Bhulaiyaa 3 128 Kbps',
           artist: 'Hritik kumar',
           thumbnail: 'download2.jpeg'
         },
         {
           songName: '128-Mere Mehboob Mere Sanam - Bad Newz 128 Kbps',
           artist: 'Rohan kumar',
           thumbnail: 'download3.jpeg'
         },
         {
           songName: '320-Rooh - Yo Yo Honey Singh 320 Kbps',
           artist: 'jai kishan kumar',
           thumbnail: 'download.jpeg'
         },
       ]
     
       const first = async () => {
         try {
           let res = await fetch('https://v1.nocodeapi.com/kumarjai/spotify/IbIBTKsrfdicMJoB/search?q=bulbula');
           let data = await JSON.parse(res);
           console.log(data)
     
         } catch (error) {
           console.log(error)
         }
       }
     
       useEffect(() => {
         first();
         setcurrentsong(songList[currentsongindex]);
       }, [currentsongindex])
       useEffect(() => {
         audioRef.current.currentTime = 0;
         audioRef.current.play();
       }, [currentsong])
     
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
         if (currentsongindex >= songList.length - 1) {
           setcurrentsongindex(0)
         } else {
           setcurrentsongindex(currentsongindex + 1)
         }
         setsongplaying(true);
       }
       const prevsong = () => {
         if (currentsongindex <= 0) {
           setcurrentsongindex(0)
         } else {
           setcurrentsongindex(currentsongindex - 1)
         }
         setsongplaying(true);
       }


  return (
    <div id="player" >
           <nav>
             <div className="ico"> <FaChevronLeft /> </div>
             <div className="ico"> <MdMenu /> </div>
           </nav>
           <div className="image">
             <img src={`/assets/thumbnail/${currentsong?.thumbnail}`} alt="" />
           </div>
           <header className='header'>
             <h2>{currentsong?.songName} </h2>
             <p>{currentsong?.artist}</p>
           </header>
           <audio ref={audioRef} src={`/assets/mp3/${currentsong?.songName}.mp3`} ></audio>
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
             <div className="ico" onClick={playpause}>{songplaying ? <FaPause /> : <FaPlay />} </div>
             <div className="ico" onClick={nextsong}><FaForward /> </div>
           </div>
   
           <div
             id="back"
             style={{
               backgroundImage: `url(/assets/thumbnail/${currentsong?.thumbnail})`,
               // backgroundImage: `url(/assets/thumbnail/IMG20230130143246.jpg)`,
               backgroundSize: 'cover',
               backgroundPosition: 'center'
             }} >  </div>
         </div>
  )
}

export default Music
