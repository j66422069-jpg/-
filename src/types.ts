export interface Project {
  id: number;
  title: string;
  type: string;
  year: string;
  thumbnail: string;
  description: string;
  intent: string;
  technical: string;
  environment: string;
  role: string;
  video_urls: VideoUrl[];
  images: string[];
  equipment: Equipment;
  is_featured: boolean;
}

export interface VideoUrl {
  label: string;
  url: string;
}

export interface Equipment {
  camera?: string;
  lens?: string;
  lighting?: string;
  color?: string;
}
