import { Suspense } from "react";
import Chat from "./Chat";

// useParams precisa ficar dentro de Suspense no next 16
export default function PaginaChat() {
  return (
    <Suspense fallback={<p className="p-6">Carregando...</p>}>
      <Chat />
    </Suspense>
  );
}
