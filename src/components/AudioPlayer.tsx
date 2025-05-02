import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  fileName: string;
}

const AudioPlayer = ({ audioUrl, fileName }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = value[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.volume = volume === 0 ? 0.75 : volume;
      setIsMuted(false);
      if (volume === 0) setVolume(0.75);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="p-4 w-full bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl shadow-md">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <div className="mb-3 truncate">
        <p className="text-sm font-medium truncate" title={fileName}>{fileName}</p>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition"
          onClick={togglePlayPause}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>
        <div className="text-xs text-muted-foreground min-w-[40px]">
          {formatTime(currentTime)}
        </div>
        <Slider 
          value={[currentTime]} 
          max={duration || 100} 
          step={0.01} 
          onValueChange={handleSeek} 
          className="flex-1 mx-2 h-2 rounded-full bg-blue-200 slider-thumb-blue"
        />
        <div className="text-xs text-muted-foreground min-w-[40px]">
          {formatTime(duration)}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-500"
          onClick={toggleMute}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        <Slider 
          value={[isMuted ? 0 : volume]} 
          max={1} 
          step={0.01} 
          onValueChange={handleVolumeChange} 
          className="w-28 h-2 rounded-full bg-blue-200 slider-thumb-blue"
        />
      </div>
    </Card>
  );
};

export default AudioPlayer;
