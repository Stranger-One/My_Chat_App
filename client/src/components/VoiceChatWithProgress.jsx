import React, { useState, useEffect } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';

const VoiceChatWithProgress = () => {
  const [audioURL, setAudioURL] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const {
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
  } = useReactMediaRecorder({
    audio: true,
    onStop: (blobUrl, blob) => {
      setAudioURL(blobUrl);
      uploadAudio(blob);
    },
  });

  // Start/stop timer when recording starts/stops
  useEffect(() => {
    let timer;
    if (timerActive) {
      timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [timerActive]);

//   const uploadAudio = async (audioBlob) => {
//     const formData = new FormData();
//     formData.append('audio', audioBlob, 'voice-message.webm');

//     try {
//       const response = await fetch('/upload-audio', {
//         method: 'POST',
//         body: formData,
//       });
//       if (response.ok) {
//         console.log('Audio uploaded successfully');
//       } else {
//         console.error('Audio upload failed');
//       }
//     } catch (error) {
//       console.error('Error uploading audio:', error);
//     }
//   };

  const handleStartRecording = () => {
    setRecordingTime(0);
    setTimerActive(true);
    startRecording();
  };

  const handleStopRecording = () => {
    setTimerActive(false);
    stopRecording();
  };

  return (
    <div>
      <div>
        <button onClick={handleStartRecording}>Start Recording</button>
        <button onClick={handleStopRecording}>Stop Recording</button>
        <button onClick={clearBlobUrl}>Clear</button>
      </div>
      <p>Recording Time: {recordingTime} seconds</p>
      {audioURL && (
        <div>
          <h3>Playback:</h3>
          <audio controls src={audioURL}></audio>
        </div>
      )}
    </div>
  );
};

export default VoiceChatWithProgress;
