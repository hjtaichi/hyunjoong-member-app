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
        <link rel="manifest" href="/manifest.json?v=114" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=113" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180-v113.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167-v113.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152-v113.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120-v113.png" />
        <meta name="theme-color" content="#071A39" />
        {/* HJTAICHI_MEMBER_COPY_PROTECTION_V1 */}
        <style
          id="hjtaichi-member-copy-protection"
          dangerouslySetInnerHTML={{
            __html: `
              html,
              body,
              body * {
                -webkit-user-select: none !important;
                user-select: none !important;
                -webkit-touch-callout: none !important;
              }

              input,
              textarea,
              [contenteditable]:not([contenteditable="false"]),
              [data-allow-copy="true"],
              input *,
              textarea *,
              [contenteditable]:not([contenteditable="false"]) *,
              [data-allow-copy="true"] * {
                -webkit-user-select: text !important;
                user-select: text !important;
                -webkit-touch-callout: default !important;
              }
            `,
          }}
        />

        <script
          id="hjtaichi-member-copy-protection-script"
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                const editableSelector =
                  'input, textarea, [contenteditable]:not([contenteditable="false"]), [data-allow-copy="true"]';

                const isCopyAllowed = (target) => {
                  const targetElement =
                    target instanceof Element ? target : null;

                  const activeElement =
                    document.activeElement instanceof Element
                      ? document.activeElement
                      : null;

                  return Boolean(
                    targetElement?.closest(editableSelector) ||
                    activeElement?.closest(editableSelector)
                  );
                };

                document.addEventListener(
                  'selectstart',
                  (event) => {
                    if (!isCopyAllowed(event.target)) {
                      event.preventDefault();
                    }
                  },
                  true
                );

                document.addEventListener(
                  'copy',
                  (event) => {
                    if (!isCopyAllowed(event.target)) {
                      event.preventDefault();
                    }
                  },
                  true
                );

                document.addEventListener(
                  'cut',
                  (event) => {
                    if (!isCopyAllowed(event.target)) {
                      event.preventDefault();
                    }
                  },
                  true
                );
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
