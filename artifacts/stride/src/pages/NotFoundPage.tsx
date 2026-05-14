import React from 'react';
import { Link } from 'wouter';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center px-4">
      <h1 className="font-brand text-8xl font-bold text-muted mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-4">Сторінку не знайдено</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Схоже, ти потрапив у сліпу зону. Ця сторінка не існує або була переміщена.
      </p>
      <Link href="/">
        <a className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90">
          Повернутися на головну
        </a>
      </Link>
    </div>
  );
}
