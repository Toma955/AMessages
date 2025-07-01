'use client';

import * as Sentry from "@sentry/nextjs";

export default function GlobalError({ error, reset }) {
  Sentry.captureException(error);

  return (
    <html>
      <body>
        <h2>Došlo je do greške!</h2>
        <button onClick={() => reset()}>Pokušaj ponovno</button>
      </body>
    </html>
  );
} 