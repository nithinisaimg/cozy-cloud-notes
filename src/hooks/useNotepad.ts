import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useNotepad = (noteName: string) => {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Load note content
  useEffect(() => {
    const loadNote = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("notes")
          .select("content")
          .eq("name", noteName)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setContent(data.content || "");
        } else {
          // Create new note if it doesn't exist
          const { error: insertError } = await supabase
            .from("notes")
            .insert({ name: noteName, content: "" });

          if (insertError) throw insertError;
          setContent("");
        }
      } catch (error) {
        console.error("Error loading note:", error);
        toast({
          title: "Error",
          description: "Failed to load note. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadNote();
  }, [noteName, toast]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`note:${noteName}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notes",
          filter: `name=eq.${noteName}`,
        },
        (payload) => {
          console.log("Realtime update:", payload);
          setContent(payload.new.content || "");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [noteName]);

  // Auto-save with debounce
  const saveContent = useCallback(
    async (newContent: string) => {
      setIsSaving(true);
      try {
        const { error } = await supabase
          .from("notes")
          .update({ content: newContent })
          .eq("name", noteName);

        if (error) throw error;
      } catch (error) {
        console.error("Error saving note:", error);
        toast({
          title: "Save failed",
          description: "Your changes couldn't be saved. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [noteName, toast]
  );

  const updateContent = useCallback(
    (newContent: string) => {
      setContent(newContent);

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for auto-save (1 second debounce)
      saveTimeoutRef.current = setTimeout(() => {
        saveContent(newContent);
      }, 1000);
    },
    [saveContent]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    content,
    isLoading,
    isSaving,
    updateContent,
  };
};
