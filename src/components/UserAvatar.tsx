interface UserAvatarProps {
  src: string;
  alt: string;
}

export function UserAvatar({ src, alt }: UserAvatarProps) {
  return (
    <img
      src={src}
      alt={alt}
      className="h-10 w-10 rounded-full object-cover"
    />
  );
}
