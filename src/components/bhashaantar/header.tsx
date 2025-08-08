import { Languages } from 'lucide-react';

export default function BhashaantarHeader() {
  return (
    <header className="bg-card border-b border-border p-4 shadow-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto flex items-center gap-4">
        <Languages className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-bold text-primary tracking-wide">
          Jyoasu converter
        </h1>
      </div>
    </header>
  );
}
