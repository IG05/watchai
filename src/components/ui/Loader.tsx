// components/Loader.tsx
export default function Loader({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
      <div className="text-lg font-medium">{message}</div>
    </div>
  );
}
