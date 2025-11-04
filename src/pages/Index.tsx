import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNotepad } from "@/hooks/useNotepad";
import { Loader2, Cloud, Users } from "lucide-react";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const noteName = searchParams.get("note");
  const [nameInput, setNameInput] = useState("");

  const handleOpenNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setSearchParams({ note: nameInput.trim() });
    }
  };

  if (!noteName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Cloud className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
              Not A "NotePad"
            </h1>
            <p className="text-lg text-muted-foreground max-w-sm mx-auto">
              Your cozy space for thoughts. Enter a unique name to create or open your note.
            </p>
          </div>

          <form onSubmit={handleOpenNote} className="space-y-4">
            <Input
              type="text"
              placeholder="Enter note name..."
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="text-lg h-12"
              autoFocus
            />
            <Button 
              type="submit" 
              className="w-full h-12 text-lg"
              disabled={!nameInput.trim()}
            >
              Open Note
            </Button>
          </form>

          <div className="pt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Share the name to collaborate in real-time</span>
          </div>
        </div>
      </div>
    );
  }

  return <NoteEditor noteName={noteName} />;
};

const NoteEditor = ({ noteName }: { noteName: string }) => {
  const { content, isLoading, isSaving, updateContent } = useNotepad(noteName);
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20 p-4">
      <div className="max-w-4xl mx-auto space-y-4 py-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setSearchParams({})}
              className="shrink-0"
            >
              ← Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{noteName}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isSaving && (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Saving...</span>
                  </>
                )}
                {!isSaving && !isLoading && (
                  <>
                    <Cloud className="w-3 h-3" />
                    <span>Saved to cloud</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-lg border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Textarea
              value={content}
              onChange={(e) => updateContent(e.target.value)}
              placeholder="Start typing your thoughts..."
              className="min-h-[600px] resize-none border-0 text-base leading-relaxed p-6 focus-visible:ring-0"
            />
          )}
        </div>

        <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Users className="w-4 h-4" />
          <span>Anyone with this note name can edit together</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
