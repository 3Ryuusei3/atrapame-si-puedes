import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { GameSetup } from "@/components/setup/GameSetup";
import { useGameStore } from "@/store/gameStore";

function GameRoute() {
  const phase = useGameStore((s) => s.phase);
  if (phase === "setup") {
    return <Navigate to="/" replace />;
  }
  return <AppShell />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GameSetup />} />
        <Route path="/game" element={<GameRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
