import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  backPath?: string;
}

const containerVariants = {
  hidden: {
    opacity: 0,
    scaleY: 0,
  },
  visible: {
    opacity: 1,
    scaleY: 1,
    transition: {
      duration: 0.05,
      ease: "easeOut",
    },
  },
} as const;

const CHILD_CONTAINER_STYLE =
  "w-full bg-black/40 p-4 md:p-10 [clip-path:polygon(10px_0,calc(100%_-_10px)_0,100%_10px,100%_calc(100%_-_10px),calc(100%_-_10px)_100%,10px_100%,0_calc(100%_-_10px),0_10px)]";

export default function PageLayout({
  title,
  children,
  backPath = "/",
}: PageLayoutProps) {
  const navigate = useNavigate();
  const [buttonSize, setButtonSize] = useState<"lg" | "xl">("xl");

  useEffect(() => {
    const handleResize = () => {
      setButtonSize(window.innerWidth < 640 ? "lg" : "xl");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate(backPath);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate, backPath]);

  return (
    <div className="flex h-dvh w-full flex-col p-2 gap-2 overflow-hidden">
      <SEO title={`${title} | INFERNOGUESSR GALLERY`} />
      <header
        className="relative w-full shrink-0 bg-black/40 py-3 text-center text-base 
        md:text-4xl [clip-path:polygon(10px_0,calc(100%_-_10px)_0,100%_10px,100%_calc(100%_-_10px),calc(100%_-_10px)_100%,10px_100%,0_calc(100%_-_10px),0_10px)]"
      >
        <div className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2">
          <Button
            variant="ghost"
            size={buttonSize}
            onClick={() => navigate(backPath)}
            className="text-2xl md:text-4xl"
            px="px-4 md:px-8"
          >
            <span className="text-xl md:text-2xl">{"<"}</span>
          </Button>
        </div>
        <span className="px-12 block truncate">{title}</span>
      </header>
      <motion.main
        className="mx-auto flex w-full flex-1 flex-col gap-2 items-center overflow-y-auto will-change-transform"
        style={{ transformOrigin: "center 50vh" }}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {React.Children.map(children, (child) => (
          <div className={CHILD_CONTAINER_STYLE}>{child}</div>
        ))}
      </motion.main>
    </div>
  );
}
