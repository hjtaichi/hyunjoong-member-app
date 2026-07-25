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
        <link rel="manifest" href="/manifest.json?v=109" />
        <meta name="theme-color" content="#071A39" />
      </head>
      <body>{children}</body>
    </html>
  );
}
