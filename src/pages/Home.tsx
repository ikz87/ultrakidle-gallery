import Button from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { useState, useEffect } from "react";

const SECTIONS = {
  primary: [
    { title: "PRELUDE", path: "/prelude" },
    { title: "ACT I: INFINITE HYPERDEATH", path: "/act-1" },
    { title: "ACT II: IMPERFECT HATRED", path: "/act-2" },
    { title: "ACT III: GODFIST SUICIDE", path: "/act-3" },
  ],
  secondary: [
    { title: "ENCORES", path: "/encores" },
    { title: "PRIME SANCTUMS", path: "/prime-sanctums" },
  ],
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const itemVariants = {
  hidden: {
    display: "none",
    opacity: 0,
  },
  visible: {
    display: "block",
    opacity: 1,
    transition: { duration: 0.02 },
  },
};

export default function Home() {
  const [buttonSize, setButtonSize] = useState<"lg" | "xl">("xl");

  useEffect(() => {
    const handleResize = () => {
      setButtonSize(window.innerWidth < 640 ? "lg" : "xl");
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col">
      <SEO title="HOME | INFERNOGUESSR" />
      
      {/* Background Layer */}
      <div className="-z-10 absolute inset-0 flex items-start justify-center pointer-events-none">
        <div
          className="flex flex-col"
          style={{ animation: "scroll-up 30s linear infinite" }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <img
              key={i}
              src="/images/terminal-bg-stacking.webp"
              alt=""
              className="w-auto block"
            />
          ))}
        </div>
      </div>

      {/* Scrollable Content Layer */}
      <div className="flex-1 pointer-events-auto overflow-y-auto flex flex-col h-dvh">
        <div className="mx-auto w-full max-w-[630px] flex flex-col pt-10 sm:pt-20 px-8 flex-shrink-0 ">
          <h1 className="text-2xl sm:text-4xl mx-auto pt-3">
            -- INFERNOGUESSR --
          </h1>
          <h2 className="text-xl sm:text-3xl mx-auto pt-3">-- GALLERY --</h2>
        </div>

        <div className="flex-1 flex items-center justify-center w-full pb-16 sm:py-16 mb-8 ">
          <motion.div
            className="mx-auto w-full max-w-[630px] flex flex-col px-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.p variants={itemVariants} className="text-2xl sm:text-3xl">
              PRIMARY
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="w-full h-0.5 bg-white mb-3"
            />
            <div className="flex flex-col gap-2">
              {SECTIONS.primary.map((item) => (
                <motion.div key={item.path} variants={itemVariants}>
                  <Link to={item.path}>
                    <Button
                      className="w-full"
                      size={buttonSize}
                      variant="outline"
                    >
                      <div className="w-full text-left">{item.title}</div>
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.p
              variants={itemVariants}
              className="text-2xl sm:text-3xl pt-10"
            >
              SECONDARY
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="w-full h-0.5 bg-white mb-3"
            />
            <div className="flex flex-col gap-2 ">
              {SECTIONS.secondary.map((item) => (
                <motion.div key={item.path} variants={itemVariants}>
                  <Link to={item.path}>
                    <Button
                      className="w-full"
                      size={buttonSize}
                      variant="outline"
                    >
                      <div className="w-full text-left">{item.title}</div>
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
