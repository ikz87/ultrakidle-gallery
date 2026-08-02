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
    { title: "SUBMITTER SEARCH", path: "/submitter-search" },
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

type MenuItem = { title: string; path: string };

function MenuButton({
  item,
  size,
}: {
  item: MenuItem;
  size: "lg" | "xl";
}) {
  return (
    <Link to={item.path}>
      <Button className="w-full" size={size} variant="outline">
        <div className="w-full text-left">{item.title}</div>
      </Button>
    </Link>
  );
}

function MenuContent({
  size,
  animated,
}: {
  size: "lg" | "xl";
  animated: boolean;
}) {
  const Wrapper = animated ? motion.div : "div";
  const Item = animated ? motion.div : "div";
  const Text = animated ? motion.p : "p";

  const wrapperProps = animated
    ? {
        initial: "hidden" as const,
        animate: "visible" as const,
        variants: containerVariants,
      }
    : {};

  const itemProps = animated ? { variants: itemVariants } : {};

  return (
    <Wrapper
      className="mx-auto w-full max-w-[630px] flex flex-col px-8"
      {...wrapperProps}
    >
      <Text {...itemProps} className="text-2xl sm:text-3xl">
        PRIMARY
      </Text>
      <Item
        {...itemProps}
        className="w-full h-0.5 bg-white md:mb-3 mb-2"
      />
      <div className="flex flex-col md:gap-2 gap-1">
        {SECTIONS.primary.map((item) => (
          <Item key={item.path} {...itemProps}>
            <MenuButton item={item} size={size} />
          </Item>
        ))}
      </div>

      <Text {...itemProps} className="text-2xl sm:text-3xl pt-10">
        SECONDARY
      </Text>
      <Item
        {...itemProps}
        className="w-full h-0.5 bg-white md:mb-3 mb-2"
      />
      <div className="flex flex-col md:gap-2 gap-1">
        {SECTIONS.secondary.map((item) => (
          <Item key={item.path} {...itemProps}>
            <MenuButton item={item} size={size} />
          </Item>
        ))}
      </div>
    </Wrapper>
  );
}

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
        <div className="mx-auto w-full max-w-[630px] flex flex-col pt-6 md:pt-16 px-8 flex-shrink-0">
          <h1 className="text-2xl font-extrabold sm:text-4xl mx-auto pt-3">
            -- INFERNOGUESSR --
          </h1>
          <h2 className="text-xl sm:text-3xl mx-auto pt-3">-- GALLERY --</h2>
        </div>

        <div className="md:py-12 py-8 grid w-full">
          {/* Placeholder: reserves final height, top-aligned */}
          <div className="[grid-area:1/1] invisible pointer-events-none ">
            <MenuContent size={buttonSize} animated={false} />
          </div>

          {/* Animated content: overlays placeholder, grows from center */}
          <div className="[grid-area:1/1] flex items-center justify-center">
            <MenuContent size={buttonSize} animated={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
