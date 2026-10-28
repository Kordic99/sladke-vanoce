# Sladké Vánoce

Vánoční plánovač pro iPhone i počítač: dobroty s vlastními obrázky, součet surovin, odškrtávání nákupů, kalendář příprav a odpočet do Štědrého dne.

Stránka **Úklid** nabízí společný seznam úkolů s místností, datem, časem a poznámkou. Úkoly lze upravovat, odškrtávat a mazat; přehled rozlišuje dnešek, prošlé termíny a hotové věci. Ukládají se do stejného soukromého plánu v Supabase a obsahují je i JSON zálohy. Starší zálohy bez úklidu zůstávají platné.

Online verze používá GitHub Pages a Supabase. Dva telefony přihlášené **stejným účtem aplikace** sdílejí recepty, fotografie, nákup i termíny. Přihlášení do administrace Supabase je oddělené.

## První otevření na telefonu

1. Otevřete publikovaný odkaz v Safari.
2. Jednou zvolte „Jsme tu poprvé – vytvořit účet“, vytvořte účet a potvrďte e-mail, pokud to Supabase vyžaduje.
3. Na obou telefonech se přihlaste stejným e-mailem a heslem aplikace.
4. Safari → Sdílet → Přidat na plochu.
5. Starý seznam přeneste přes „Stáhnout zálohu“ v původní verzi a „Načíst zálohu“ v online verzi. Import nahrazuje celý společný seznam; stačí ho provést jednou.

Změny se odesílají automaticky. Druhý otevřený telefon je přijímá přes Supabase Realtime; při přerušení spojení se seznam kontroluje také každých osm sekund a při návratu do aplikace. Při souběžných úpravách aplikace odmítne přepsání novějšího seznamu, zachová místní změny a nabídne jejich zálohu. Neodeslané změny mají místní zálohu svázanou s účtem.

Kalendář ukazuje příštích sedm dní a připomene dnešní úkoly při otevření aplikace. Upozornění při zavřené aplikaci ani plné spuštění bez internetu nejsou implementované.

## Nasazení GitHub Pages + Supabase

1. V samostatném projektu Supabase spusťte migraci `supabase/migrations/202610150001_christmas_plans.sql`.
2. Povolte přihlašování e-mailem a heslem. Pro potvrzovací e-maily nastavte Site URL na publikovanou adresu aplikace.
3. V GitHub → Settings → Secrets and variables → Actions → **Variables** nastavte:
   - `VITE_SUPABASE_URL`: Project URL.
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: aktivní publishable klíč (případně legacy `anon`).
4. Settings → Pages → Source: GitHub Actions. GitHub Pages u soukromého repozitáře vyžaduje odpovídající placený tarif GitHub; před změnou viditelnosti repozitáře zkontrolujte obsah a schvalte zveřejnění zdrojů.
5. Spusťte workflow „Publish Sladké Vánoce“. Další změny v `main` se publikují automaticky.

Publishable klíč je určený pro prohlížeč. **Nikdy sem nevkládejte `service_role`, `sb_secret_...`, databázové heslo ani přístupový token administrace.** Databáze zapíná RLS a čtení povoluje jen přihlášenému vlastníkovi řádku. Ukládání probíhá funkcí, která odvozuje vlastníka z `auth.uid()` a kontroluje revizi atomicky; přímé zápisy klienta jsou zakázané. Osobní seznamy ani přihlašovací údaje se do GitHubu neukládají.

## Vývoj a ověření

Node.js 22.18 nebo novější:

```sh
npm ci
cp .env.example .env.local
# Doplňte veřejnou konfiguraci Supabase do .env.local.
npm run dev:cloud
npm test
npm run typecheck
npm run build:cloud
```

Výstup pro statický hosting je `dist-pages/`. `PAGES_BASE_PATH` může určit podadresář; výchozí relativní cesty fungují i na GitHub Pages. Workflow používá `/sladke-vanoce/`.

Testy pokrývají součty a jednotky, validaci záloh a obrázků, kalendář i synchronizaci dvou klientů: souběžné zápisy, výpadek připojení, obnovu rozpracovaných změn a opožděné odpovědi. Integraci databáze je nutné ověřit po aplikaci migrace v konkrétním projektu.

## Původní Sites a samostatná verze

`app/standalone.tsx` zachovává ukládání pouze v daném prohlížeči. `app/page.tsx` a `/api/plan` jsou původní varianta pro Sites s D1 a ChatGPT přihlášením. Nejsou používány statickým nasazením GitHub Pages. Následuje dokumentace zachované serverové šablony.

# Vinext / Sites

A clean full-stack starter running on [vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`
- Portable: Windows, macOS, or Linux; no Bash required
- Managed Linux: managed Linux runtime with Bash, `flock`, `curl`, `sha256sum`, and GNU `timeout`
- Git is required only for publishing

## Sites Lifecycle

The Sites initializer copies the shared starter and selects managed-linux only when `SITES_MANAGED_LINUX_CONTAINER=1`; otherwise it selects portable. It saves the selection only in ignored `.sites-runtime/execution-profile.json`. Both profiles copy/configure first, then use the plugin's separate `install-dependencies.mjs` step to measure installation independently. Edit source under `app/` and follow the Sites skill for installation, preview, builds, and publishing.

Run `node <plugin-root>/scripts/configure-execution-profile.mjs` only when the profile is unknown for the current checkout and environment. Profile changes do not alter tracked source or require reinstalling otherwise-valid dependencies; restart an existing preview to use the new selection. Do not commit or upload `.sites-runtime/`.

This starter does not use `wrangler.jsonc`.

`install:ci` runs `npm ci` once against the shared lockfile, disables parent-workspace discovery, and includes required dev/optional dependencies despite production/omit settings. Sharp defaults to prebuilt binaries unless explicitly configured otherwise. Do not overlap installers.

- **Portable:** Preserve host HOME, npm cache, registry, proxy, temporary paths, retry/concurrency settings, and lifecycle-script policy. Use `--prefer-offline --no-audit --no-fund`.
- **Managed Linux:** Use the existing project-local HOME/cache/tmp setup and Linux install lock, tarball preflight, and timeout. Restore the image-seeded npm cache only when its lockfile hash matches; retain network fallback. Builds keep their existing timeout. These helpers are not invoked by the portable profile.

`scripts/sites-env.mjs` preserves the caller's HOME, npm cache, proxy, XDG, and temporary-directory configuration while defaulting Wrangler and Miniflare state to the checkout. If npm reports an unwritable cache, select a writable path with `npm_config_cache` for that install. The `dev` and `start` scripts also keep Wrangler logs inside the checkout. Generated `.sites-runtime/` and `.wrangler/` directories are disposable and ignored by Git.

On portable, `npm run dev` uses `vinext dev` with HMR, starting at port 5173. Vinext records the running server in ignored `.vinext/` state, rejects an ordinary duplicate launch, and recovers stale state after a stopped process; exactly simultaneous starts can race. Pass `--port <port>` or `--hostname <host>` after `npm run dev --` when needed; keep portable previews on loopback.

For browser QA on managed Linux, use `sites-preview start`. The project's dev script runs Vite and accepts the supervisor's `--host 0.0.0.0 --port 4173 --strictPort` arguments. The internal browser uses `http://terminal.local:4173/`; it is not a user-facing URL. The supervisor owns the preview lifecycle. The ignored local profile survives the supervisor's cleared process environment.

The portable profile simulates ChatGPT sign-in only for loopback development requests. Visit `/signin-with-chatgpt?return_to=/` to sign in as `local_seedy` (`seedy@sites.test`, display name `Seedy`) and `/signout-with-chatgpt?return_to=/` to sign out. The development cookie preserves that identity across server restarts. Mock auth is disabled in the managed-linux profile and is not included in production builds; hosted authentication remains dispatch-owned.

The Worker uses `vinext/server/fetch-handler`, including Vinext's config-aware image handling. After building, `npm start` runs that Worker locally through Wrangler on `127.0.0.1`, sharing `.wrangler/state` with dev preview and local D1 migrations; it does not deploy the site or simulate sign-in. Use the URL printed by the server. Pass `npm start -- --port <port>` to select a different built-preview port.

Local previews use Miniflare's placeholder `Request.cf` metadata without a network lookup. Set `CLOUDFLARE_CF_FETCH_ENABLED=true` to opt into fetching preview metadata; this setting does not change hosted request metadata.

Local tool usage metrics are disabled by default. Set `WRANGLER_SEND_METRICS=true` to opt in.

## Included Shape

- edit site code under `app/`
- `app/chatgpt-auth.ts` provides optional dispatch-owned ChatGPT sign-in helpers
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/index.ts` reads the D1 binding from the Cloudflare Worker environment
- `db/schema.ts` starts intentionally empty
- `@cloudflare/workers-types` provides Worker types; `cloudflare-env.d.ts` declares optional `DB`/`BUCKET` bindings—update these declarations if binding names change
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

Signed-in visitors receive both `oai-authenticated-user-id` and `oai-authenticated-user-email`. Private Sites require every visitor to sign in; public Sites may also have anonymous visitors, for whom neither header is present.

The user ID is stable for the same user on the same Site and different across Sites. Use it as the durable user key; use email and name for display or contact purposes.

SIWC-authenticated workspace sites may also receive `oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty `name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by `oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const userId = requestHeaders.get("oai-authenticated-user-id");
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use the returned `userId` as the stable user key for user-owned records; do not use email as a durable identifier.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send anonymous visitors through Sign in with ChatGPT.
- In a Server Component, start sign-in with `<a href={chatGPTSignInPath(returnTo)} target="_top">`. The auth helper module is server-only; do not import it into a Client Component.
- Do not use `fetch`, XHR, a client-side router, or a framework link that can prefetch the sign-in route. SIWC must start as a top-level navigation.
- Never request the AuthAPI authorization endpoint directly. The dispatch-owned `/signin-with-chatgpt` route must start the SIWC flow.
- Use `chatGPTSignOutPath(returnTo)` for browser sign-out links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the OAuth cookies, and identity header injection. Do not implement app routes for those reserved paths. Routes that do not import and call the helper remain anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the Sites hosting platform's access policy controls for workspace-wide restrictions, or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write actions tied to the current ChatGPT user. Leave public content anonymous.

## Local D1 migrations

For a D1-backed local preview, generate SQL with `npm run db:generate`. Build once through the Sites skill's build entrypoint (or `npm run build` for standalone use) to generate `dist/server/wrangler.json`, rebuilding if bindings change. From the project root, apply each pending migration in order:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_example.sql
```

Replace the filename with the pending migration and `DB` with your D1 binding name if different. Use `.wrangler/state`, not `.wrangler/state/v3`; Wrangler adds the versioned directories. Do not replay migrations already applied locally. This updates only the preview database; publishing applies production migrations separately.

## Diagnostic Commands

- `npm run install:ci`: perform the one locked dependency install
- `npm run dev`: start the Vite/Vinext development server
- `npm run build`: build the deployable Sites artifact
- `npm run start`: preview the built Worker locally with D1/R2 support
- `npm run db:generate`: generate Drizzle migrations after schema changes

When using the Sites plugin, follow its skill instructions for installation, builds, and publishing. These npm commands remain available for standalone use.

The portable build runs Vinext directly without a host `timeout` command. The managed-linux build uses `scripts/build-verified.sh` and its existing `SITES_BUILD_TIMEOUT` setting.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
