import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileImage, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface HomeworkUploadProps {
  onChallengeCreated: () => void;
}

export const HomeworkUpload = ({ onChallengeCreated }: HomeworkUploadProps) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove the data:image/jpeg;base64, prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('אנא בחר קובץ תמונה');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('גודל הקובץ חייב להיות עד 5MB');
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');

    try {
      // Convert image to base64
      const base64Image = await convertToBase64(file);

      // Call the edge function to analyze the homework
      const { data, error } = await supabase.functions.invoke('analyze-homework-image', {
        body: {
          imageBase64: base64Image,
          userId: user.id
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'שגיאה בניתוח התמונה');
      }

      if (data.success) {
        setUploadStatus('success');
        toast.success(data.message || 'אתגר חדש נוצר בהצלחה!');
        onChallengeCreated();
      } else {
        throw new Error(data.error || 'שגיאה לא ידועה');
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast.error('שגיאה בהעלאת התמונה: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
      // Reset status after 3 seconds
      setTimeout(() => setUploadStatus('idle'), 3000);
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Upload className="h-6 w-6 text-primary" />;
    }
  };

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'מנתח את שיעורי הבית...';
      case 'success':
        return 'אתגר חדש נוצר!';
      case 'error':
        return 'שגיאה בהעלאה';
      default:
        return 'העלה תמונה של שיעורי הבית';
    }
  };

  if (!user) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <FileImage className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            התחבר כדי להעלות שיעורי בית ולקבל אתגרים מותאמים
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <FileImage className="h-5 w-5" />
          צור אתגר משיעורי הבית
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-center">
          <div className="mb-4">
            {getStatusIcon()}
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            העלה תמונה של שיעורי הבית באנגלית שלך ואני אצור בשבילך אתגר מותאם!
          </p>

          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <Button
              disabled={isUploading}
              className="w-full bg-gradient-hero hover:opacity-90"
            >
              {getStatusText()}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            קבצי תמונה עד 5MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
};