"use client";

import { useState, useCallback } from "react";
import BhashaantarHeader from "@/components/bhashaantar/header";
import AudioInput from "@/components/bhashaantar/audio-input";
import ResultsDisplay from "@/components/bhashaantar/results-display";
import { useToast } from "@/hooks/use-toast";

import { transcribeHindi } from "@/ai/flows/hindi-asr";
import { enhanceTranscription } from "@/ai/flows/transcription-tool";
import { translateHindiToEnglish } from "@/ai/flows/hindi-to-english-translation";

export type Accent = "Indian" | "General";

export default function BhashaantarPage() {
  const [accent, setAccent] = useState<Accent>("Indian");
  const [hindiText, setHindiText] = useState("");
  const [englishText, setEnglishText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fileToDataUri = (file: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleAudioSubmit = useCallback(async (audioBlob: Blob) => {
    if (!audioBlob) return;

    setError(null);
    setHindiText("");
    setEnglishText("");
    setIsTranscribing(true);
    setIsTranslating(false);

    try {
      const audioDataUri = await fileToDataUri(audioBlob);
      
      const asrResult = await transcribeHindi({ audioDataUri, accent });
      let finalTranscription = asrResult.transcription;

      if (asrResult.transcription === "") {
        throw new Error("Speech could not be recognized. Please try again with clearer audio.");
      }

      if (asrResult.alternativeTranscriptions && asrResult.alternativeTranscriptions.length > 0) {
        try {
            const enhancedResult = await enhanceTranscription({
                originalText: asrResult.transcription,
                alternativeWords: asrResult.alternativeTranscriptions,
            });
            finalTranscription = enhancedResult.enhancedText;
        } catch (e) {
            console.warn("Could not enhance transcription, falling back to original.");
        }
      }
      
      setHindiText(finalTranscription);
      setIsTranscribing(false);
      setIsTranslating(true);

      const translationResult = await translateHindiToEnglish({ hindiText: asrResult.transcription });
      setEnglishText(translationResult.englishText);

    } catch (e: any) {
      console.error(e);
      const errorMessage = e.message || "An unexpected error occurred.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
      setIsTranslating(false);
    }
  }, [accent, toast]);

  const isLoading = isTranscribing || isTranslating;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <BhashaantarHeader />
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8">
        <div className="space-y-8">
          <AudioInput
            accent={accent}
            onAccentChange={setAccent}
            onAudioSubmit={handleAudioSubmit}
            isLoading={isLoading}
          />
          <ResultsDisplay
            isTranscribing={isTranscribing}
            isTranslating={isTranslating}
            hindiText={hindiText}
            englishText={englishText}
            error={error}
          />
        </div>
      </main>
    </div>
  );
}
