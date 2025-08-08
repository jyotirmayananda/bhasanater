"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import type { Accent } from "@/app/page";
import { Mic, Upload, FileAudio, Waves, Square, CircleDashed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AudioInputProps {
  accent: Accent;
  onAccentChange: (accent: Accent) => void;
  onAudioSubmit: (audioBlob: Blob) => void;
  isLoading: boolean;
}

export default function AudioInput({ accent, onAccentChange, onAudioSubmit, isLoading }: AudioInputProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorderRef.current.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        onAudioSubmit(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      });

      mediaRecorderRef.current.start();
      setIsRecording(true);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setRecordingTime(0);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (["audio/mpeg", "audio/wav", "audio/mp3"].includes(file.type)) {
        setSelectedFile(file);
      } else {
        alert("Unsupported file format. Please upload .mp3 or .wav");
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
       if (["audio/mpeg", "audio/wav", "audio/mp3"].includes(file.type)) {
        setSelectedFile(file);
      } else {
        alert("Unsupported file format. Please upload .mp3 or .wav");
      }
    }
  };

  const handleProcessFile = () => {
    if (selectedFile) {
      onAudioSubmit(selectedFile);
    }
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Get Started</CardTitle>
        <CardDescription>Provide Hindi audio by recording or uploading a file.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <Tabs defaultValue="record">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="record"><Mic className="mr-2 h-4 w-4"/> Record Audio</TabsTrigger>
                <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4"/> Upload File</TabsTrigger>
              </TabsList>
              <TabsContent value="record" className="mt-4">
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg text-center h-48">
                  {isRecording ? (
                    <>
                      <Waves className="h-12 w-12 text-destructive animate-pulse" />
                      <p className="font-mono text-2xl mt-4">{formatTime(recordingTime)}</p>
                      <Button onClick={stopRecording} variant="destructive" className="mt-4" disabled={isLoading}>
                        <Square className="mr-2 h-4 w-4"/> Stop Recording
                      </Button>
                    </>
                  ) : (
                    <>
                      <Mic className="h-12 w-12 text-primary" />
                      <p className="text-muted-foreground mt-2">Click to start recording</p>
                      <Button onClick={startRecording} className="mt-4" disabled={isLoading}>
                        Start Recording
                      </Button>
                    </>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="upload" className="mt-4">
                 <div
                    onDragEnter={() => setIsDragging(true)}
                    onDragLeave={() => setIsDragging(false)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className={cn(
                        "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg text-center h-48 transition-colors",
                        isDragging ? "border-primary bg-accent/20" : ""
                    )}
                >
                  <input type="file" id="audio-upload" className="hidden" onChange={handleFileChange} accept=".mp3,.wav" disabled={isLoading} />
                  {selectedFile ? (
                    <>
                      <FileAudio className="h-12 w-12 text-primary" />
                      <p className="font-medium mt-2">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                      <Button variant="link" onClick={() => setSelectedFile(null)}>Choose another file</Button>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-primary" />
                      <p className="text-muted-foreground mt-2">Drag & drop or <Label htmlFor="audio-upload" className="text-primary underline cursor-pointer">browse</Label></p>
                      <p className="text-xs text-muted-foreground mt-1">Supports: MP3, WAV</p>
                    </>
                  )}
                </div>
                 {selectedFile && (
                    <Button onClick={handleProcessFile} className="w-full mt-4" disabled={isLoading}>
                      {isLoading ? <><CircleDashed className="mr-2 h-4 w-4 animate-spin"/> Processing...</> : "Process File"}
                    </Button>
                )}
              </TabsContent>
            </Tabs>
          </div>
          <div className="space-y-4 text-center md:text-left">
            <Label htmlFor="accent-select" className="font-bold">Hindi Accent</Label>
            <Select value={accent} onValueChange={(value) => onAccentChange(value as Accent)} disabled={isLoading}>
              <SelectTrigger id="accent-select">
                <SelectValue placeholder="Select accent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Indian">Indian</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Choosing the right accent improves transcription accuracy.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
