import { Routes, Route, Navigate } from "react-router-dom";
import "@/App.css";
import Home from "@/pages/Home";
import Prelude from "@/pages/Prelude";
import Act1 from "@/pages/Act1";
import Act2 from "@/pages/Act2";
import Act3 from "@/pages/Act3";
import Encores from "@/pages/Encores";
import PrimeSanctums from "@/pages/PrimeSanctums";
import LevelGallery from "@/pages/LevelGallery";
import SEO from "@/components/SEO";

export default function App() {
  return (
    <div className="relative h-dvh w-dvw overflow-hidden bg-black p-0">
      <SEO 
        title="INFERNOGUESSR" 
        description="Ultrakill level guessing gallery" 
      />
      <video
        autoPlay
        muted
        loop
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        className="pointer-events-none absolute left-0 top-0 h-full w-full object-cover"
      >
        <source src="/videos/elevator.mp4" type="video/mp4" />
      </video>
      <main className="relative z-10 h-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/prelude" element={<Prelude />} />
          <Route path="/act-1" element={<Act1 />} />
          <Route path="/act-2" element={<Act2 />} />
          <Route path="/act-3" element={<Act3 />} />
          <Route path="/encores" element={<Encores />} />
          <Route path="/prime-sanctums" element={<PrimeSanctums />} />
          <Route path="/:layerPath/:levelName/:imgId?" element={<LevelGallery />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
