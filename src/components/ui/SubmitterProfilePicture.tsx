interface SubmitterProfilePictureProps {
  url?: string;
  className?: string;
}

export default function SubmitterProfilePicture({
  url,
  className = "w-8 h-8 rounded-full",
}: SubmitterProfilePictureProps) {
  return (
    <img
      src={url || "/images/v1-plush.webp"}
      className={`${className} object-cover`}
      alt="Submitter profile"
    />
  );
}
