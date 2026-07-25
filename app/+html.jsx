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
        <link rel="manifest" href="/manifest.json?v=112" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=113" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180-v113.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167-v113.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152-v113.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120-v113.png" />
        <meta name="theme-color" content="#071A39" />
      </head>
      <body>{children}</body>
    </html>
  );
}
