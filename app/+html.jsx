import { ScrollViewStyleReset } from "expo-router/html";

export default function Root({ children }) {
  return (
    <html lang="ko">
      <head>
        <ScrollViewStyleReset />

        <link rel="manifest" href="/manifest.json" />

        <meta name="theme-color" content="#2B221D" />
      </head>

      <body>{children}</body>
    </html>
  );
}