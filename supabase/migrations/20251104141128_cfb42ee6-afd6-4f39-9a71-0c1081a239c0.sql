-- Create notes table
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  content TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since notes are shared by name)
CREATE POLICY "Anyone can view notes"
  ON public.notes
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create notes"
  ON public.notes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update notes"
  ON public.notes
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete notes"
  ON public.notes
  FOR DELETE
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notes_updated_at();

-- Enable realtime for the notes table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;