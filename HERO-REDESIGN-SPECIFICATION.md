# Portfolio Hero — Redesign & Implementation Specification

**Prepared by:** Senior Product Designer / Frontend Architect / UX Engineer
**Audience:** Codex (implementation agent)
**Constraint:** Presentation-only redesign. Zero changes to data flow, field names, API shape, or CMS contract unless explicitly called out in §14–16. Every field currently rendered from the backend (`FULL-STACK DEVELOPER & AI ENGINEER` eyebrow, headline + highlighted word, description, `Explore Projects` / `Contact Me` CTAs, `Open to opportunities` availability, social icons, nav, portrait, background) must continue to render exactly as-is — only its layout, scale, and treatment change.

---

## 1. Current UI Analysis

Reading the attached hero screenshot directly:

**Typography & Hierarchy.** The eyebrow (`FULL-STACK DEVELOPER & AI ENGINEER`) is correctly the smallest, but the H1 (`testing testing` / `digital experiences.`) is set at a size that reads as a large sub-heading, not a hero statement — on a 1920px viewport it occupies well under a third of the available width. Both lines sit at the same visual weight relative to the page; nothing about the type scale says "this is the one sentence you're meant to read first." Line-height on the heading is tight enough that the two lines almost touch, which reduces its presence further rather than making it feel dense/confident.

**Spacing & Content Width.** The description paragraph wraps at roughly 380–400px, which is narrower than it needs to be given the amount of empty canvas to its right and above. Vertical rhythm between eyebrow → heading → description → CTAs → availability row is even but cramped — every gap looks like the same default stack spacing rather than a designed rhythm that gives the heading room to breathe before the smaller text starts.

**Portrait Placement.** The portrait is pinned to the right edge, bottom-cropped by the viewport, with no visible top-of-head margin above it and no bottom edge treatment — it simply gets cut off by the fold. It reads as an image that was placed rather than composed into the layout. There's no visual bridge between the portrait and the content column; they occupy separate halves of the screen with a hard, ungraded seam between the dark content background and the portrait's background rectangle.

**Background Composition.** The background is a single flat dark panel on the left transitioning to a muddy brown-gold rectangle behind the portrait's shoulders, with a faint city skyline silhouette along the very bottom edge. It reads as three unrelated layers stacked (solid panel / gold rectangle / skyline strip) rather than one continuous atmospheric scene. There's no depth — no foreground/midground/background separation, no light source, no falloff. The gold area behind the portrait looks like a spotlight backdrop rather than ambient environmental light.

**Lighting.** Flat. The portrait itself has directional lighting from the reference photo, but the hero background around it doesn't participate in that lighting — there's no rim light, glow, or gradient that makes the subject look like it belongs in the scene rather than being cut out and placed on top of it.

**Visual Balance & Empty Space.** The left content column is vertically centered in a way that leaves large, unstructured dead space above the eyebrow and below the social icons. The right half's dead space (top of portrait, far right edge) isn't doing any compositional work — no glow, gradient, or atmospheric detail fills it, so it just reads as "unused."

**CTA Hierarchy.** `Explore Projects` (filled gold) versus `Contact Me` (outline) is the correct pattern, but at current scale both buttons look like default UI-kit buttons — modest radius, modest padding, no differentiation in presence beyond fill vs. outline. Next to a hero heading this small, the CTAs don't feel like the natural next step in a visual hierarchy — they feel like the next stack item.

**Readability.** Contrast is fine (light text on dark background), but the description's narrow measure combined with the small heading means the eye has no clear entry point — nothing anchors "start reading here."

**Premium Feeling — what's missing.** The elements that read "premium" in Stripe/Linear/Apple/Framer/Vercel-tier heroes — oversized, confident typography; a single well-composed light source; generous, intentional negative space that still feels considered rather than empty; a portrait that's lit to match its environment; micro-details like a soft vignette or gradient mesh — are all absent. What's on screen isn't broken, it's *unfinished*: correct components, template-level composition.

---

## 2. Problems

- Heading is undersized relative to viewport — reads as a subhead, not a hero statement.
- Heading line-height is too tight for a 2-line, large-scale treatment.
- Description column is narrower than the available space justifies.
- Vertical spacing is uniform/default rather than a designed rhythm (tight where it should breathe, loose where it should be tight).
- Portrait has no top or bottom containment — crops abruptly at the viewport edge.
- No visual bridge between the content column and the portrait — hard seam, two unrelated halves.
- Background is three disconnected flat layers (panel / gold block / skyline strip), not one atmospheric composition.
- No depth cues — no foreground/midground/background separation, no falloff, no vignette.
- No light-source logic connecting the portrait's own lighting to its surroundings — no rim light or ambient glow bridging subject and scene.
- Right-side and top empty space isn't doing compositional work — reads as unused canvas, not intentional negative space.
- CTAs are UI-kit default scale/radius, undersized next to the (currently small) heading.
- No clear "start here" focal entry point for the eye.
- Overall: correct content, template-level presentation — nothing cinematic, nothing that signals a designed light source or intentional atmosphere.

---

## 3. Design Philosophy

**Direction:** Cinematic minimalism. One dominant light source (warm gold, upper-right, behind/around the subject), everything else recedes into charcoal and black. The hero is not "text block + photo" — it's one lit scene the text sits inside.

**Signature element:** A single soft gold volumetric glow originating behind the portrait's upper shoulder/head area, which does three jobs at once — lights the subject's rim, motivates the background's gold tones (replacing the flat gold rectangle), and pulls the eye from the heading across to the portrait, physically connecting the two halves the current layout keeps separate. This is the one bold move; everything else — spacing, type, motion — stays disciplined and quiet around it.

**Non-negotiables carried forward:** black/charcoal base, gold accent, warm highlights, all existing copy and data fields, all existing CTAs/social icons/nav, dynamic CMS-driven portrait and background.

**What "premium" means here, concretely:** oversized, confident type with real breathing room; one legible light source instead of flat panels; a portrait that looks lit *by* the scene, not placed *on* it; negative space that's graded (glow, fog, vignette) rather than empty; restrained motion that arrives once, deliberately, on load.

---

## 4. New Hero Layout

Two-zone asymmetric composition, roughly 55/45 on desktop, content-led:

```
┌─────────────────────────────────────────────────────────────────┐
│  NAV (unchanged)                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│   [eyebrow]                                     .                │
│                                              .       ·  (soft     │
│   HEADLINE LINE ONE                       gold glow, upper-      │
│   HEADLINE LINE            ·             right, behind portrait  │
│   TWO highlighted·                          head/shoulder)       │
│                                                                   │
│   Description text, wider measure,                               │
│   comfortable line-height, 2–3 lines            ┌───────────┐    │
│                                                  │           │    │
│   [Explore Projects →]  [Contact Me]            │  PORTRAIT │    │
│                                                  │  (bleeds  │    │
│   ● Open to opportunities  [ico][ico][ico]      │  to bottom│    │
│                                                  │  edge)    │    │
│                                                  └───────────┘    │
│                                                                   │
│  ambient background: graded charcoal → gold glow → soft skyline  │
│  silhouette + fog, low in the frame, full-bleed, vignette edges  │
└─────────────────────────────────────────────────────────────────┘
```

- Content column shifts left, given a wider max-width for the description (see §5) and vertically anchored slightly above center (not perfectly centered) so the heading's baseline sits in the golden-ratio zone of the viewport, giving the eye a clear starting point.
- Portrait moves from "pinned to the edge, cropped by viewport" to **intentionally bottom-bleeding** (it's meant to run off the bottom edge — that's a compositional choice, not a crop accident) while gaining clear headroom above (empty space between the top of the hair and the nav) so it stops looking cut off.
- The gold glow sits *behind* the portrait's head/shoulder line and extends leftward into the content column's negative space — this is what replaces the current flat gold rectangle and is what visually "connects" content and portrait, per the design philosophy.
- Skyline silhouette (from the background reference direction) is pushed low and back — a thin horizon band with soft fog/mist rising from it, rather than a hard-edged strip glued to the bottom of the viewport.
- A soft vignette darkens all four edges of the hero so the composition reads as one contained scene rather than a full-bleed flat rectangle.

---

## 5. Spacing System

8px base unit, applied with intent rather than uniformly:

| Relationship | Current feel | New spec |
|---|---|---|
| Nav → Eyebrow | tight | `clamp(48px, 8vh, 96px)` — generous top-of-hero breathing room |
| Eyebrow → Headline | tight | `20px` — eyebrow reads as a distinct label, not glued to the heading |
| Headline internal line-height | ~1.05 (cramped) | `0.98–1.02` at the new larger scale — tight-but-controlled, a deliberate premium-display choice, not an accident of default line-height |
| Headline → Description | small | `32px` |
| Description → CTAs | small | `40px` — CTAs get their own beat, not a continuation of the text stack |
| CTAs → Availability row | small | `28px` |
| Content column max-width | ~420px | `min(640px, 48vw)` for the description; heading unconstrained up to its own line-break logic |
| Content column left inset | default container padding | `clamp(24px, 6vw, 96px)` |
| Portrait top clearance (from nav) | ~0 (crops at fold) | `min 64px`, scales with viewport height |
| Hero vertical padding (top/bottom of section) | uneven | `clamp(64px, 10vh, 120px)` top; bottom intentionally bleeds portrait + skyline past the fold, no hard bottom padding on that half |

---

## 6. Typography System

No new typefaces required — refine scale and weight of the existing system.

| Role | Current (approx.) | New |
|---|---|---|
| Eyebrow | ~13px, letterspaced, gold | `14px / 0.08em tracking / 600 weight` — unchanged position, slightly more letterspacing for a premium "label" feel |
| Headline | ~40–44px, weight ~700 | `clamp(56px, 7.5vw, 104px)`, weight 700–800, line-height `0.98–1.02`, max 2 lines by design (matches existing 2-line content: base line white, highlight line gold) |
| Description | ~16px, line-height ~1.5 | `18–20px`, line-height `1.65`, max-width per §5 — wider measure, more relaxed leading |
| Buttons | ~15px | `16–17px`, weight 600, increased horizontal padding (see below) |
| Availability label | ~14px | `14px`, unchanged — it's correctly a quiet, secondary element |

**Button scale:** padding from ~`12px 24px` to `16px 32px`; radius stays pill/rounded (matches existing brand — not changed) but the gold fill button gains a subtle inner glow/shadow so it reads as the primary action against the now-larger heading, not a same-weight sibling to it.

---

## 7. Portrait Placement Rules

The portrait is CMS-supplied and must not be hardcoded to one image's proportions. Rules, not fixed pixel values:

- **Container, not image, defines the frame.** The portrait sits in a fixed-aspect container (recommend `4:5` or `3:4` portrait-oriented box) positioned in the right ~40–45% of the hero. The image inside uses `object-fit: cover; object-position: top center` so any CMS-supplied portrait — regardless of its own source resolution or crop — always frames the subject's head/shoulders consistently and never squashes or letterboxes.
- **Bottom-bleed by design.** The container's bottom edge aligns with (or slightly exceeds) the hero section's bottom edge, so the subject appears to stand *in* the scene rather than float in a box. This must be an intentional `overflow`/negative-margin treatment, not an accidental fold-crop — apply a soft fade-to-transparent gradient mask on the bottom ~15% of the image so the bleed is graceful, not a hard cut.
- **Top clearance is mandatory.** Minimum headroom above the subject's hair per §5, enforced by the container's `aspect-ratio` + `align-self`, so a portrait with a different head position never collides with the nav.
- **Edge treatment, not a hard rectangle.** The container's left edge (facing the content column) uses a soft mask/gradient (image → transparent) rather than a visible box border, so the portrait dissolves into the background instead of sitting in a visible rectangle — this is what fixes the "hard seam" problem from §2.
- **Rim-light compatibility.** Because portraits will be regenerated over time (§ Image Asset Specification below), the design assumes — and the future asset brief specifies — a portrait already lit with a warm rim/backlight on the side facing the glow source, so the CSS-side glow (a radial gradient positioned behind the container) and the photo's own lighting reinforce each other rather than fighting.
- **Responsive scaling:** the container scales fluidly (`clamp()`-based width tied to viewport) rather than switching between fixed breakpoint sizes, so any aspect-ratio-conforming CMS portrait resizes proportionally without art-direction breakpoints.

---

## 8. Background Composition Rules

Background is CMS-supplied (a skyline/atmospheric image) but is **never rendered alone** — it's always composited with CSS-driven atmosphere layers so it looks intentional regardless of which specific image the CMS serves:

**Layer stack (back to front):**
1. **Base color** — solid charcoal/black (existing token), always present as a fallback even before the CMS image loads.
2. **CMS background image** — the skyline/cityscape, object-fit cover, opacity reduced (~40–55%) and positioned low in the frame (object-position: bottom), so it reads as a distant horizon rather than a full-strength photo competing with the foreground content.
3. **Depth gradient (CSS, always present)** — a vertical gradient from transparent at the top to the base charcoal color at the very bottom, seating the skyline into "haze" rather than letting it float with a hard top edge.
4. **Gold ambient glow (CSS radial gradient, always present)** — positioned behind the portrait's head/shoulder zone (per §4/§7), soft-edged, low-opacity, warm gold — this is the one signature light source and it must be independent of the CMS image so it looks intentional on *any* background asset.
5. **Fog/mist band (optional CSS layer, low-opacity blurred gradient shape)** — sits just above the skyline layer, adds depth separation between horizon and midground.
6. **Vignette (CSS, always present)** — soft darkening at all four edges, keeps focus centered on subject + heading, unifies whatever the CMS image's edges look like.

This layered approach means the CMS can serve any similarly-toned cityscape/atmosphere image in the future and the composition will still read as intentional, because layers 3–6 are code-owned, not image-dependent.

---

## 9. Animation Strategy

One orchestrated load sequence, then stillness — per the frontend-design principle that an orchestrated moment lands harder than scattered effects.

**On load (staggered, ~600–900ms total), Framer Motion:**
1. Eyebrow fades + slides up 8px (`delay 0`)
2. Headline fades + slides up 12px, lines can stagger by ~80ms each (`delay ~0.1s`)
3. Description fades + slides up 8px (`delay ~0.3s`)
4. CTAs fade + slight scale-in (`delay ~0.4s`)
5. Availability row fades in (`delay ~0.5s`)
6. Portrait fades + slides in from a slight scale (1.02 → 1) with the glow fading in slightly after it, so the light appears to "switch on" around the subject (`delay ~0.2s`, running in parallel with the text column)

**Ambient (subtle, continuous, optional):** the gold glow layer may pulse in scale/opacity by a few percent on a slow (~8–10s) loop — barely perceptible, gives the scene life without reading as an "effect."

**Micro-interactions:** CTA buttons get a restrained hover — gold button gains a slightly stronger glow/shadow, outline button's border shifts to gold on hover — no bounce, no rotation.

**Explicitly avoided:** parallax-on-scroll gimmicks, particle effects, glitch/hacker-style motion (ruled out by the "not futuristic, not gaming" brief constraint), continuous heavy animation on the portrait itself.

`prefers-reduced-motion`: disable the load stagger (render final state immediately) and the ambient glow pulse; keep only the hover state changes, which are instant/utility rather than decorative.

---

## 10. Responsive Behavior

**Desktop (≥1280px):** Layout as described in §4 — asymmetric two-zone, heading at max clamp size, portrait bottom-bleeding at full container height.

**Tablet (768–1279px):** Content column and portrait remain side-by-side but the ratio shifts toward ~60/40; heading clamp scales down proportionally; description max-width tightens to keep line length readable (~55–65 characters); portrait container shrinks but keeps the same aspect-ratio/bleed/mask rules — no cropping logic changes, just scale.

**Mobile (<768px):** Stack vertically — content column first (eyebrow → heading → description → CTAs → availability), portrait becomes a contained, top-cropped or centered image **below or behind** the text as a full-width band with the gold glow and vignette still applied, rather than side-by-side. Heading clamp drops to a mobile-appropriate range (`clamp(36px, 10vw, 48px)`) but stays multi-line and bold — never shrinks to "just another paragraph" scale. CTAs stack full-width or wrap to two columns depending on final copy length; availability row wraps beneath if needed. Bottom-bleed/mask treatment on the portrait is preserved but scaled to the mobile viewport so it doesn't overwhelm the screen.

All breakpoints share the same component tree and CSS custom properties (fluid `clamp()`-based sizing throughout) rather than three separate hand-built layouts — this keeps the CMS-driven dynamic content (which can vary in length) reflowing predictably at every size.

---

## 11. Accessibility

- Heading and description remain real semantic `<h1>`/`<p>` elements — no change to document structure, only presentation.
- Color contrast: verify the description text color against the new, darker/graded background layers (§8) meets WCAG AA (4.5:1) at every point behind it — the added gradient/vignette layers must not drop contrast below current levels; adjust text color/weight if needed once composited.
- Motion respects `prefers-reduced-motion` (§9) — this is a hard requirement, not optional polish.
- CTA buttons keep visible keyboard focus states (a gold focus ring, consistent with the accent) — current focus styling must not be lost in the redesign.
- Portrait `alt` text remains CMS-driven and unchanged; decorative background/glow layers are marked `aria-hidden`/`role="presentation"` since they carry no content.
- Availability status icon + social icons retain their existing accessible labels — layout-only change, no label/semantics regression.

---

## 12. Performance

- Background image continues to load via the existing CMS-driven `<img>`/`next/image` pipeline — no new image weight added; the "depth" (§8) is achieved through CSS gradients/blur, not additional image assets, keeping payload flat.
- Gold glow and vignette are pure CSS (`radial-gradient`, `box-shadow`, or a single blurred pseudo-element) — zero additional network requests.
- Portrait uses `next/image` with `priority` (it's above-the-fold, LCP-relevant) and an explicit `sizes` attribute matching the responsive container widths from §10, so the browser never downloads a larger asset than the viewport needs.
- Framer Motion load sequence (§9) is a one-time, short-duration animation — no scroll-linked or continuously-recalculated motion that would cost main-thread work post-load.
- Any blur-heavy CSS (fog layer) uses `filter: blur()` on a small, GPU-composited layer rather than blurring the full background image, to avoid repaint cost.
- Fallback: if the CMS background image is slow/unavailable, the base charcoal color + gold glow (§8, layers 1 and 4) alone already produce an acceptable, on-brand hero — the design degrades gracefully rather than showing a blank panel.

---

## 13. Frontend Architecture

**Component hierarchy:**

```
<HeroSection>                            # section wrapper, owns background composition
  ├── <HeroBackground>                   # §8 layered background — pure presentation
  │     ├── <HeroBackgroundImage />      # CMS image, object-fit cover, opacity/position per §8
  │     ├── <HeroDepthGradient />        # CSS gradient overlay
  │     ├── <HeroGlow />                 # gold radial-gradient signature element, positioned per portrait anchor
  │     ├── <HeroFogLayer />             # optional blurred mist band
  │     └── <HeroVignette />             # CSS edge-darkening overlay
  │
  ├── <HeroContent>                      # left column, unchanged data, new layout/type treatment
  │     ├── <HeroEyebrow text={cms.eyebrow} />
  │     ├── <HeroHeadline
  │     │     base={cms.headlineBase}
  │     │     highlight={cms.headlineHighlight} />
  │     ├── <HeroDescription text={cms.description} />
  │     ├── <HeroCTAGroup>
  │     │     ├── <CTAButton variant="primary" {...cms.primaryCta} />
  │     │     └── <CTAButton variant="outline" {...cms.secondaryCta} />
  │     └── <HeroAvailabilityRow
  │           status={cms.availability}
  │           socials={cms.socialLinks} />
  │
  └── <HeroPortrait                      # §7 — container-driven, aspect-ratio locked
        src={cms.portraitUrl}
        alt={cms.portraitAlt} />
```

**Folder structure (Next.js 15 / App Router assumption, adjust only if the existing repo already differs):**

```
components/
  hero/
    HeroSection.tsx              # composes background + content + portrait, orchestrates load animation via Framer Motion
    HeroBackground.tsx           # §8 layer stack
    HeroGlow.tsx                 # isolated so it can be reused/tuned independently (also usable on other CMS-lit sections later)
    HeroEyebrow.tsx
    HeroHeadline.tsx             # handles the two-line base/highlight split — same data shape as today, just new type scale
    HeroDescription.tsx
    HeroCTAGroup.tsx
    HeroAvailabilityRow.tsx
    HeroPortrait.tsx             # aspect-ratio container + object-fit + mask, per §7
    hero.module.css / hero.tokens.ts   # spacing/type/gradient tokens from §5–8, so numbers live in one place, not scattered across components
```

**Props (no new fields — same shape the CMS already provides, only consumed by new presentational components):**

```ts
type HeroContentProps = {
  eyebrow: string;
  headlineBase: string;
  headlineHighlight: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  availabilityStatus: string;       // e.g. "Open to opportunities"
  socialLinks: { icon: string; href: string; label: string }[];
  portraitUrl: string;
  portraitAlt: string;
  backgroundUrl: string;
};
```

**State:** none required for the static hero content itself (it's server/CMS-fetched, same as today). Only local state introduced is a `hasAnimated` ref/flag inside `HeroSection` to ensure the load-in sequence (§9) runs once and never re-triggers on re-render (e.g. from unrelated parent state changes).

**Data flow:** unchanged. CMS → existing backend endpoint → existing data-fetching layer (server component / existing hook, whichever the current implementation uses) → same prop shape passed into `HeroSection`. This spec only changes what `HeroSection` and its children render internally with that data — the fetch boundary is untouched.

---

## 14. CMS Impact

**No new fields required.** Every value used in this redesign (`eyebrow`, `headlineBase`, `headlineHighlight`, `description`, both CTAs, `availabilityStatus`, `socialLinks`, `portraitUrl`, `portraitAlt`, `backgroundUrl`) already exists in the current CMS/data contract, per the constraint that the current fields are sufficient. The only *behavioral* expectation placed on future CMS-supplied images (not a schema change) is the portrait/background art direction described in §7–8 and formalized in the **Image Asset Specification** at the end of this document — this is a content/asset guideline for whoever generates future images, not a new field or validation rule.

---

## 15. Backend Impact

**None.** No API changes, no new endpoints, no renamed fields, no new response shape. This is a pure frontend presentation change consuming the exact same payload the Hero already receives today.

---

## 16. Migration Guide

1. Introduce the new `components/hero/*` component set alongside (not replacing) the current Hero implementation initially, behind a feature flag or a direct swap in a single PR — implementer's choice, but do not touch the existing data-fetching call.
2. Verify every existing prop maps 1:1 into the new component tree (§13 props table) with no renamed keys.
3. Add the token file (`hero.tokens.ts`) capturing §5/§6/§8 values so numbers aren't hardcoded inline.
4. Build `HeroBackground` layers (§8) first and validate against the *current* CMS background image before any new image asset exists — the layered approach must already look intentional on today's asset, not just a future regenerated one.
5. Build `HeroPortrait` (§7) against the current CMS portrait next, same validation logic — confirm bottom-bleed/mask/headroom rules hold with today's image before assuming a future regeneration.
6. Wire the Framer Motion load sequence (§9) last, gated by `prefers-reduced-motion`.
7. Cross-browser/responsive QA at the three breakpoint tiers in §10.
8. Accessibility pass (§11): contrast check against the composited background, focus states, reduced-motion behavior.
9. Only after the component is verified against current assets should new portrait/background images (per the Image Asset Specification below) be generated and swapped in via the CMS — no code change required at that point, confirming the design truly doesn't depend on one exact image.
10. Remove the old Hero component once the new one is confirmed in production.

---

## 17. Codex Implementation Instructions

Build `components/hero/` exactly as specified in §13.

- Do not alter the data-fetching layer, prop names, or backend calls that currently supply Hero content. Consume the existing prop shape as-is.
- Implement `HeroBackground` as a layered stack per §8: base color → CMS image (object-fit cover, object-position bottom, opacity 40–55%) → vertical depth gradient (transparent → base color) → radial gold glow positioned behind the portrait anchor point → optional blurred fog band → edge vignette. All layers except the CMS image are pure CSS, no additional image requests.
- Implement `HeroGlow` as an isolated, reusable radial-gradient component, anchored to align with the top-right/upper area of `HeroPortrait`'s container regardless of viewport size — position it using the portrait container's coordinates/CSS variables, not fixed pixel values.
- Implement `HeroPortrait` as an aspect-ratio-locked container (`aspect-ratio: 4/5` default, confirm against current asset), `object-fit: cover`, `object-position: top center`, with a bottom fade-to-transparent mask (`mask-image: linear-gradient(...)`) and a left-edge fade for the seam into the content column. Container must bottom-align/bleed with the hero section's lower edge. Use `next/image` with `priority` and a `sizes` attribute matching §10's breakpoint widths.
- Implement `HeroHeadline` to render the existing base + highlighted-word structure at `font-size: clamp(56px, 7.5vw, 104px)`, `line-height: 0.98–1.02`, `font-weight: 700–800`. Preserve the existing mechanism for which word/phrase is gold-highlighted — do not change how that's determined, only its rendered scale.
- Implement `HeroDescription` at `font-size: 18–20px`, `line-height: 1.65`, `max-width: min(640px, 48vw)`.
- Implement `HeroCTAGroup` preserving existing button component/variant logic; increase padding to `16px 32px`, font-size to `16–17px`; add a subtle glow/shadow to the primary (filled) button on default and hover states; outline button gets a hover border-color shift to the gold accent token.
- Apply spacing tokens exactly as specified in §5 (use CSS custom properties or a shared `hero.tokens.ts`, not inline magic numbers).
- Implement the load-in sequence in `HeroSection` using Framer Motion exactly as staggered in §9 (eyebrow → headline → description → CTAs → availability, portrait+glow in parallel), gated entirely off when `prefers-reduced-motion: reduce` is set (render final state with no animation, no stagger).
- Implement responsive behavior per §10: side-by-side asymmetric layout ≥768px (ratio shifts from ~55/45 desktop to ~60/40 tablet), full vertical stack <768px with portrait rendered as a contained full-width band beneath/behind the text content, background layers (§8) still fully applied at every breakpoint.
- Ensure `<h1>`/`<p>` semantic elements are preserved; mark all decorative background/glow/fog/vignette layers `aria-hidden="true"`.
- Verify computed text contrast against the fully composited background (all §8 layers stacked) meets WCAG AA; adjust text color/weight only if needed to satisfy this, not layout.
- Do not introduce parallax-on-scroll, particle systems, or continuous heavy motion on the portrait. Only the one-time load sequence and the restrained hover/focus states described above.
- Do not modify any CMS schema, API route, or backend field. If a genuine schema gap is discovered during implementation, stop and flag it — do not silently add a field.

---

## IMAGE ASSET SPECIFICATION

*This is a separate prompt, to be used later with an image-generation model to produce the two future CMS assets. It is written for that image model, not for Codex, and is not an implementation instruction. Extract visual direction only from the two reference images provided — do not reproduce them, their specific architecture, logos, or any recognizable branded elements; treat them purely as a lighting/mood/composition reference.*

### 1. Portrait — Transparent PNG

- **Output format:** PNG-24 with a true alpha channel (transparent background) — no white or colored background baked in, must composite cleanly over the Hero's dark, gold-lit background layers.
- **Resolution:** minimum 2000×2500px (4:5 portrait aspect ratio), sufficient headroom to safely crop to the Hero's `aspect-ratio: 4/5` container at any responsive scale without softening.
- **Framing/crop:** three-quarter to half-body, from roughly mid-torso up to just above the top of the head, with clear empty margin above the hair (do not crop the top of the head tight to the canvas edge) and margin to the sides for safe repositioning within the Hero container.
- **Body position:** subject angled slightly (roughly ¾ turn), shoulders and torso turned a few degrees off-camera, head turned back slightly further toward camera or slightly past it — a confident, relaxed stance, not a straight-on passport-style pose.
- **Camera angle:** eye-level to very slightly below eye-level, subtle upward angle for a confident, elevated presence — no extreme low-angle "hero shot" distortion.
- **Hoodie details:** solid black or near-black hoodie, minimal visible branding/graphics, hood down, drawstrings visible and naturally hanging, fabric texture visible enough to catch rim light along the shoulder and hood edge.
- **Lighting:** primary light source warm and soft, positioned upper-frame (motivating the Hero's gold glow), sculpting the face with gentle warm highlight on the cheekbone/brow/nose-bridge side and letting the opposite side fall into soft shadow — not full silhouette, facial features should remain clearly readable.
- **Rim light:** a distinct warm gold rim/edge light along the hair, shoulder, and hood outline on the side facing the primary light — this is the detail that must visually connect to the Hero's CSS-driven glow layer once composited.
- **Facial expression:** calm, confident, slightly contemplative — a subtle, closed-mouth near-neutral expression with a hint of ease, not smiling broadly, not stern.
- **Background during generation:** pure flat neutral (white or grey) for clean alpha extraction — final delivery must have that background fully removed.
- **Color/tone:** skin tones rendered naturally and warmly under the gold key light; no color-cast on the black hoodie beyond the warm rim edge.

### 2. Background — Standalone Cityscape/Atmosphere

- **Output format:** standard flattened image (JPG or PNG), no transparency needed.
- **Resolution:** minimum 2560×1440px (16:9), safely croppable to the Hero section's full-bleed width at any viewport without upscaling.
- **Composition:** a distant, moody city skyline occupying roughly the lower third to lower half of the frame, silhouetted and layered (a few buildings taller and more detailed in the midground, a denser hazy silhouette further back) — generic architectural forms only, no recognizable real-world or fictional landmark buildings, no logos, no readable signage/text on any structure.
- **Skyline treatment:** mostly dark silhouette with scattered warm gold window-lights, low density of light so it reads as ambient texture rather than a busy, cluttered scene.
- **Fog/mist:** a soft, low-lying haze band sitting just above the skyline's rooftops, warm-toned near the light source and cooling toward the edges of the frame, giving atmospheric depth separation between skyline and sky.
- **Moon/sky element:** an optional large, soft-focus moon or warm glowing orb positioned upper-frame off to one side (not dead-center), partially veiled by thin cloud, acting as a secondary motivator for the scene's warm top-down light — this should read as ambient sky lighting, not a literal focal subject competing with the portrait.
- **Lighting:** consistent single warm light logic throughout — the same gold key light implied by the moon/glow should be what's lighting the tops of buildings and the underside of the cloud/fog layer, so the whole scene feels like one coherent light source rather than multiple unrelated highlights.
- **Negative space:** the upper two-thirds of the frame should be predominantly dark, gradient sky with minimal detail — this is intentional empty canvas reserved for the Hero's text content and the portrait's upper body to sit against without visual competition.
- **Hero compatibility:** design the composition knowing roughly 40–55% opacity will be applied and it will sit *behind* a CSS gold radial glow and vignette (§8) — avoid baking in a background so busy or high-contrast that it fights the foreground content once composited; err toward a slightly darker, lower-contrast base than the reference image, since the CSS layers add the primary "pop."
- **Depth:** clear foreground (near-black silhouette, sharp edges), midground (lit skyline, some detail, warm highlights), background (soft, hazy, low-contrast atmosphere/sky) — three distinct depth bands.
- **Colors:** near-black and dark charcoal base throughout, warm gold/amber for all light sources (windows, moon glow, fog highlights), no other accent colors — strictly monochrome-plus-gold, matching the fixed brand palette.

**Combination requirement:** portrait and background are generated as fully independent assets and must not be pre-composited. When placed together in the Hero per §7–8 — background at reduced opacity behind the CSS gradient/glow/vignette stack, portrait as a masked foreground element with its own rim light aligned to the same upper-right light direction as the background's moon/glow — the two must read as one coherently lit scene despite being separate files.
