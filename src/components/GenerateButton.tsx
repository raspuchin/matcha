import "./GenerateButton.css";

interface GenerateButtonProps {
  disabled: boolean;
  onGenerate: () => void;
}

export function GenerateButton({ disabled, onGenerate }: GenerateButtonProps) {
  return (
    <button
      className="generate-btn"
      disabled={disabled}
      onClick={onGenerate}
    >
      Generate Round
    </button>
  );
}
