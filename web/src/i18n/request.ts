import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// Messages are split one file per namespace under messages/{locale}/*.json
// (each file's top-level key is its own namespace, e.g. cifras.json =>
// {"cifras": {...}}) rather than one giant JSON file — that keeps
// independent page translations from stepping on each other when edited
// concurrently, and keeps each file small enough to review on its own.
function loadMessages(locale: string) {
  const dir = path.join(process.cwd(), "messages", locale);
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

  return Object.assign(
    {},
    ...files.map((file) => JSON.parse(readFileSync(path.join(dir, file), "utf-8"))),
  );
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: loadMessages(locale),
  };
});
