import { useEffect, useRef } from "react";

interface GalleryImageProps {
  src: string;
  alt?: string;
  className?: string;
  eager?: boolean;
}

const MAX_DPR = 2;

export default function GalleryImage({
  src,
  alt = "",
  className,
  eager = false,
}: GalleryImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let observer: IntersectionObserver | undefined;
    let hasRendered = false;
    let frame = 0;
    let lastSize = "";

    const render = () => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (cancelled || !canvasRef.current) return;
        const out = canvasRef.current;

        const rect = out.parentElement?.getBoundingClientRect();
        const boxW = rect?.width || img.naturalWidth;
        const boxH = Math.min(rect?.height || img.naturalHeight, window.innerHeight * 0.7);

        // Parents that grow after mount (the gallery modal finishes animating
        // and its stats load) would otherwise leave a canvas sized for the
        // pre-layout box forever.
        const sizeKey = `${Math.round(boxW)}x${Math.round(boxH)}`;
        if (sizeKey === lastSize) return;
        lastSize = sizeKey;
        hasRendered = true;

        const ratio = img.naturalWidth / img.naturalHeight;
        let dispW = boxW;
        let dispH = dispW / ratio;
        if (dispH > boxH) {
          dispH = boxH;
          dispW = dispH * ratio;
        }

        const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
        const targetW = Math.max(
          1,
          Math.min(img.naturalWidth, Math.round(dispW * dpr))
        );
        const targetH = Math.max(
          1,
          Math.round((img.naturalHeight / img.naturalWidth) * targetW)
        );

        let curW = img.naturalWidth;
        let curH = img.naturalHeight;
        let source: CanvasImageSource = img;
        while (curW > targetW * 2) {
          const nextW = Math.max(targetW, Math.floor(curW / 2));
          const nextH = Math.max(1, Math.round(curH * (nextW / curW)));
          const off = document.createElement("canvas");
          off.width = nextW;
          off.height = nextH;
          const octx = off.getContext("2d");
          if (!octx) break;
          octx.imageSmoothingEnabled = true;
          octx.imageSmoothingQuality = "high";
          octx.drawImage(source, 0, 0, nextW, nextH);
          source = off;
          curW = nextW;
          curH = nextH;
        }

        out.width = targetW;
        out.height = targetH;
        const ctx = out.getContext("2d");
        if (!ctx) return;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(source, 0, 0, targetW, targetH);
      };
      img.src = src;
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!cancelled) render();
      });
    };

    // The available box changes after mount in two places: the modal animates
    // in (scale) and its stats panel grows once the guesses arrive. Without
    // this the canvas stays sized for the first layout.
    const resizeObserver = new ResizeObserver(() => {
      if (hasRendered) schedule();
    });
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

    if (eager) {
      render();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer?.disconnect();
            render();
          }
        },
        { rootMargin: "300px" }
      );
      observer.observe(canvas);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      observer?.disconnect();
    };
  }, [src, eager]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={alt || undefined}
      className={className}
    />
  );
}
