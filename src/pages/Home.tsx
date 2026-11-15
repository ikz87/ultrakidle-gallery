import Button from "@/components/ui/Button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import SubmitterProfilePicture from "@/components/ui/SubmitterProfilePicture";
import { useAuth } from "@/lib/auth";

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
type ButtonSize = "lg" | "xl";

function MenuButton({ item, size }: { item: MenuItem; size: ButtonSize }) {
  return (
    <Link to={item.path}>
      <Button className="w-full" size={size} variant="outline">
        <div className="w-full text-left">{item.title}</div>
      </Button>
    </Link>
  );
}

function SignInIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6 md:w-8 md:h-8"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="square"
      aria-hidden="true"
    >
      <path d="M14 4h5v16h-5" />
      <path d="M4 12h10" />
      <path d="M10 8l4 4-4 4" />
    </svg>
  );
}

function AccountRow({
  size,
  signedIn,
  avatarUrl,
  onSignIn,
  onAccount,
}: {
  size: ButtonSize;
  signedIn: boolean;
  avatarUrl?: string;
  onSignIn: () => void;
  onAccount: () => void;
}) {
  return (
    <div className="flex items-stretch gap-1 md:gap-2 w-full">
      <Button
        variant="outline"
        size={size}
        onClick={signedIn ? onAccount : onSignIn}
        px="px-0"
        py="py-0"
        className="shrink-0 h-12 w-12 md:h-16 md:w-16"
        aria-label={signedIn ? "Account" : "Sign in with Discord"}
      >
        {signedIn ? (
          <SubmitterProfilePicture
            url={avatarUrl}
            className="w-7 h-7 md:w-10 md:h-10 rounded-full"
          />
        ) : (
          <SignInIcon />
        )}
      </Button>

      {signedIn ? (
        <Link to="/me" className="flex-1">
          <Button variant="outline" size={size} className="w-full">
            <div className="w-full text-left">MY SUBMISSIONS</div>
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size={size} disabled className="flex-1">
          <div className="w-full text-left">MY SUBMISSIONS</div>
        </Button>
      )}
    </div>
  );
}

function MenuContent({
  size,
  animated,
  account,
}: {
  size: ButtonSize;
  animated: boolean;
  account: {
    signedIn: boolean;
    avatarUrl?: string;
    onSignIn: () => void;
    onAccount: () => void;
  };
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
        <Item {...itemProps}>
          <AccountRow size={size} {...account} />
        </Item>
      </div>
    </Wrapper>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, user, authError, signInWithDiscord, signOut } = useAuth();

  const [buttonSize, setButtonSize] = useState<ButtonSize>("xl");
  const [loginOpen, setLoginOpen] = useState(
    () => Boolean((location.state as { openLogin?: boolean } | null)?.openLogin)
  );
  const [accountOpen, setAccountOpen] = useState(false);

  const signedIn = Boolean(session);
  const avatarUrl: string | undefined = user?.user_metadata?.avatar_url;
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.user_name ||
    user?.user_metadata?.preferred_username ||
    "DISCORD USER";

  // Drop the one-shot flag so a refresh or back-navigation doesn't reopen it.
  useEffect(() => {
    if ((location.state as { openLogin?: boolean } | null)?.openLogin) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  useEffect(() => {
    const handleResize = () => {
      setButtonSize(window.innerWidth < 640 ? "lg" : "xl");
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const account = {
    signedIn,
    avatarUrl,
    onSignIn: () => setLoginOpen(true),
    onAccount: () => setAccountOpen(true),
  };

  const handleSignOut = async () => {
    setAccountOpen(false);
    await signOut();
  };

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
            <MenuContent size={buttonSize} animated={false} account={account} />
          </div>

          {/* Animated content: overlays placeholder, grows from center */}
          <div className="[grid-area:1/1] flex items-center justify-center">
            <MenuContent size={buttonSize} animated={true} account={account} />
          </div>
        </div>
      </div>

      <Modal
        isOpen={loginOpen && !signedIn}
        onClose={() => setLoginOpen(false)}
        title="SIGN IN"
        maxWidth="max-w-md"
        showFooterButton={false}
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="text-sm md:text-base uppercase tracking-tighter text-white/80">
            Link your Discord account to see and manage your submissions
          </p>
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              void signInWithDiscord();
            }}
          >
            LOGIN WITH DISCORD
          </Button>
          {authError && (
            <p className="text-xs text-[#FF8000] uppercase tracking-tighter">
              {authError}
            </p>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={accountOpen && signedIn}
        onClose={() => setAccountOpen(false)}
        title="ACCOUNT"
        maxWidth="max-w-md"
        showFooterButton={false}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <SubmitterProfilePicture
              url={avatarUrl}
              className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-white shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <p className="text-lg md:text-xl font-bold uppercase truncate text-white">
                {displayName}
              </p>
              <p className="text-xs text-white/50 uppercase tracking-tighter">
                Discord account linked
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link to="/me" onClick={() => setAccountOpen(false)}>
              <Button variant="outline" size="md" className="w-full">
                MY SUBMISSIONS
              </Button>
            </Link>
            <Button
              variant="danger"
              size="md"
              className="w-full"
              onClick={() => {
                void handleSignOut();
              }}
            >
              LOG OUT
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
