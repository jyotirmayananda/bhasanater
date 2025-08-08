import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Download, AlertCircle, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ResultsDisplayProps {
  isTranscribing: boolean;
  isTranslating: boolean;
  hindiText: string;
  englishText: string;
  error: string | null;
}

export default function ResultsDisplay({ isTranscribing, isTranslating, hindiText, englishText, error }: ResultsDisplayProps) {
  
  const downloadTxtFile = () => {
    const element = document.createElement("a");
    const file = new Blob([englishText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = "bhashaantar_translation.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const isLoading = isTranscribing || isTranslating;
  const hasResults = hindiText && englishText;

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/10 text-destructive-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle />
            An Error Occurred
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!isLoading && !hasResults) {
    return null;
  }

  const LoadingState = () => (
    <div className="space-y-4">
        <div className="flex items-center gap-4">
            <p className="w-32 text-sm font-medium">{isTranscribing ? "Transcribing..." : "Translating..."}</p>
            <Progress value={isTranscribing ? 40 : 80} className="w-full" />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Hindi Transcription</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>English Translation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
        </div>
    </div>
  );

  if (isLoading) {
      return <LoadingState />;
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 animate-in fade-in-50 duration-500">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Hindi Transcription</CardTitle>
          <CardDescription className="flex items-center text-xs text-muted-foreground">
              <Sparkles className="w-3 h-3 mr-1 text-accent-foreground fill-accent"/>
              AI-enhanced for clarity
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert min-h-[100px] text-lg leading-relaxed">
          <p>{hindiText}</p>
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>English Translation</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert min-h-[100px] text-lg leading-relaxed">
          <p>{englishText}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={downloadTxtFile} disabled={!englishText}>
            <Download className="mr-2 h-4 w-4" /> Download .txt
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
