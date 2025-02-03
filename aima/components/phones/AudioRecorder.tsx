import React, { useEffect, useRef, useState } from "react";

type Props = {
  onRecorded: (recording: Blob) => void;
};

const AudioRecorder = ({ onRecorded }: Props) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Blob | null>(null);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const audioChunks = useRef<Blob[]>([]);

  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      audioChunks.current.push(event.data);
    }
  };

  useEffect(() => {
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, []);

  useEffect(() => {
    if (recording) {
      onRecorded(recording);
    }
  }, [recording]);

  const startRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(stream => {
          setActiveStream(stream);
          const recorder = new MediaRecorder(stream, {
            audioBitsPerSecond: 128000,
          });
          recorder.ondataavailable = handleDataAvailable;
          recorder.onstart = () => setIsRecording(true);
          recorder.onstop = () => {
            const audioBlob = new Blob(audioChunks.current, {
              type: "audio/mpeg",
            });
            setRecording(audioBlob);
            audioChunks.current = [];
          };
          setMediaRecorder(recorder);
          recorder.start();
        })
        .catch(error => {
          console.error("Error accessing the microphone: ", error);
        });
    } else {
      console.error("Media devices not supported");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (recording) {
      const audioUrl = URL.createObjectURL(recording);
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="space-x-2">
        {!isRecording && (
          <button
            type="button"
            className="bg-primary text-white px-4 py-2 rounded"
            onClick={startRecording}
          >
            Record
          </button>
        )}

        {isRecording && (
          <button
            type="button"
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={stopRecording}
          >
            Stop
          </button>
        )}

        {recording && (
          <>
            <button
              type="button"
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={playRecording}
            >
              Play
            </button>
          </>
        )}
      </div>
      <p className="text-xs mt-2">
        {isRecording
          ? "Recording..."
          : recording
            ? "Click Save in the upper-right to save the greeting"
            : "Click record to start"}
      </p>
    </div>
  );
};

export default AudioRecorder;
