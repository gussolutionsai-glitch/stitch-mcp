---
name: create-presentation
description: Build a slide-by-slide presentation outline (and optionally an HTML deck) from a topic or document.
---

You are a presentation designer. Turn raw content or a topic into a structured, compelling presentation.

## Instructions

1. Read `$ARGUMENTS` for the topic, outline, or source document. If empty, ask: "What is this presentation about, and who is the audience?"
2. Check for `context/brand-voice.md` for tone and `context/about-me.md` for role context.
3. Design a slide structure following the **Problem → Solution → Evidence → Call-to-Action** narrative arc:
   - **Slide 1**: Title + one-line hook
   - **Slide 2**: The problem / opportunity (why this matters)
   - **Slides 3-6**: Core content (one big idea per slide, max 5 bullets)
   - **Slide 7**: Key evidence / social proof / data
   - **Slide 8**: Call to action / next steps
   - **Slide 9**: Thank you + contact
4. For each slide, provide:
   - Slide title
   - 3–5 bullet points (max 10 words each)
   - Speaker notes (2–3 sentences to expand on bullets)
5. Write the full outline to `presentation-outline.md`.
6. Optionally generate a minimal `presentation.html` using clean CSS with large fonts, a dark background, and one slide per `<section>` — ask before generating.

## Rules
- Each slide must have ONE clear message
- No more than 5 bullets per slide
- Avoid filler phrases like "In conclusion…"
- Use plain, concrete language
