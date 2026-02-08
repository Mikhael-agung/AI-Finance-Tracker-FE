export default function ErrorMessage({ message }: { message?: string }) {
  return <div>{message || "Error"}</div>;
}
