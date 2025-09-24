-- Create storage bucket for homework images
INSERT INTO storage.buckets (id, name, public) VALUES ('homework-images', 'homework-images', false);

-- Create policies for homework images storage
CREATE POLICY "Students can upload their own homework images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'homework-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can view their own homework images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'homework-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can delete their own homework images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'homework-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create table for AI generated challenges based on homework
CREATE TABLE public.ai_generated_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_path TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  questions JSONB NOT NULL,
  difficulty_level TEXT NOT NULL DEFAULT 'beginner',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_generated_challenges ENABLE ROW LEVEL SECURITY;

-- Create policies for AI generated challenges
CREATE POLICY "Users can view their own AI challenges"
ON public.ai_generated_challenges
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI challenges"
ON public.ai_generated_challenges
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI challenges"
ON public.ai_generated_challenges
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI challenges"
ON public.ai_generated_challenges
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_generated_challenges_updated_at
BEFORE UPDATE ON public.ai_generated_challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();