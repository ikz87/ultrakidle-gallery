import Button from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";

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
  return (
    <div className="relative overflow-hidden h-screen w-full flex flex-col">
      <SEO title="HOME | INFERNOGUESSR" />
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

      <div className="mx-auto w-full max-w-[630px] flex flex-col pt-20 px-8">
        <h1 className="text-4xl mx-auto pt-3">-- INFERNOGUESSR --</h1>
        <h2 className="text-3xl mx-auto pt-3">-- GALLERY --</h2>
      </div>

      <div className="flex-1 flex items-center justify-center w-full">
        <motion.div
          className="mx-auto w-full max-w-[630px] flex flex-col px-8 pb-20"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.p variants={itemVariants} className="text-3xl">
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
                  <Button className="w-full" size="xl" variant="outline">
                    <div className="w-full text-left">{item.title}</div>
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.p variants={itemVariants} className="text-3xl pt-10">
            SECONDARY
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="w-full h-0.5 bg-white mb-3"
          />
          <div className="flex flex-col gap-2">
            {SECTIONS.secondary.map((item) => (
              <motion.div key={item.path} variants={itemVariants}>
                <Link to={item.path}>
                  <Button className="w-full" size="xl" variant="outline">
                    <div className="w-full text-left">{item.title}</div>
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
