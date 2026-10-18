import React, { useState, useRef, useEffect } from "react";
import { IoPlay, IoPause } from "react-icons/io5";

const VoiceNotePlayer = ({ audioUrl, isSent = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoaded = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const cycleSpeed = () => {
    const rates = [1, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatSec = (secs) => {
    if (isNaN(secs) || secs === Infinity) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex items-center gap-3 p-1.5 min-w-[240px] max-w-[320px] select-none">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-sm transition-transform active:scale-95 ${
          isSent ? "bg-wa-teal dark:bg-emerald-600" : "bg-wa-teal"
        }`}
      >
        {isPlaying ? <IoPause size={18} /> : <IoPlay size={18} className="ml-0.5" />}
      </button>

      {/* Progress & Timing */}
      <div className="flex-1 flex flex-col gap-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-black/10 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-wa-teal"
        />
        <div className="flex items-center justify-between text-[11px] text-wa-text-secondary-light dark:text-wa-text-secondary-dark">
          <span>{formatSec(currentTime)}</span>
          <span>{formatSec(duration)}</span>
        </div>
      </div>

      {/* 1x / 1.5x / 2x Speed button */}
      <button
        type="button"
        onClick={cycleSpeed}
        className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-wa-text-primary-light dark:text-wa-text-primary-dark hover:bg-black/10 transition-colors"
      >
        {playbackRate}x
      </button>
    </div>
  );
};

export default VoiceNotePlayer;
