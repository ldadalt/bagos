import './MessageDisplay.css';

interface MessageDisplayProps {
  message: string;
}

export default function MessageDisplay({ message }: MessageDisplayProps) {
  return <div className="message-display">{message}</div>;
}

