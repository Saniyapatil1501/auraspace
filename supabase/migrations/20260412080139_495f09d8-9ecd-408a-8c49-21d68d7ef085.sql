
-- Add new columns to journal_entries
ALTER TABLE public.journal_entries
  ADD COLUMN title TEXT,
  ADD COLUMN intensity TEXT DEFAULT 'medium',
  ADD COLUMN is_favorite BOOLEAN DEFAULT false;

-- Allow users to update their own entries
CREATE POLICY "Users can update their own entries"
ON public.journal_entries
FOR UPDATE
USING (auth.uid() = user_id);
