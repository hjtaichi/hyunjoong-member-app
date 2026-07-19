import { ScrollViewStyleReset } from "expo-router/html";

export default function Root({ children }) {
  return (
    <html lang="ko">
      <head>
        <ScrollViewStyleReset />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />

        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2B221D" />
        <link
          rel="preload"
          href="/loading-screen-v101.webp"
          as="image"
          type="image/webp"
          media="(display-mode: standalone)"
        />

        <style>{`
          #pwa-launch-screen {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 2147483647;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #f2e6ca;
            opacity: 1;
            pointer-events: none;
            transition: opacity 280ms ease;
          }

          #pwa-launch-screen img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center center;
          }

          #pwa-launch-screen.pwa-launch-screen-hidden {
            opacity: 0;
          }

          @media (display-mode: standalone) {
            #pwa-launch-screen {
              display: block;
            }
          }
        `}</style>
      </head>

      <body>
        <div id="pwa-launch-screen" aria-hidden="true">
          <img src="/loading-screen-v101.webp" alt="" />
        </div>

        {children}

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                const splash = document.getElementById("pwa-launch-screen");
                if (!splash) return;

                const standalone =
                  window.matchMedia("(display-mode: standalone)").matches ||
                  window.navigator.standalone === true;

                if (!standalone) {
                  splash.remove();
                  return;
                }

                const startedAt = Date.now();
                let hidden = false;

                const hideSplash = () => {
                  if (hidden) return;
                  hidden = true;

                  const elapsed = Date.now() - startedAt;
                  const remaining = Math.max(0, 900 - elapsed);

                  window.setTimeout(() => {
                    splash.classList.add("pwa-launch-screen-hidden");
                    window.setTimeout(() => splash.remove(), 320);
                  }, remaining);
                };

                if (document.readyState === "complete") {
                  hideSplash();
                } else {
                  window.addEventListener("load", hideSplash, { once: true });
                }

                window.setTimeout(hideSplash, 7000);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}