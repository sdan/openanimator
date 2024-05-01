interface VideoComponentProps {
  url: string;
}

export const VideoComponent: React.FC<VideoComponentProps> = ({ url }) => (
  <video controls width="300">
    <source src={url} type="video/mp4" />
    Your browser does not support the video tag.
  </video>
);
