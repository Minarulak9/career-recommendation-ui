# Frontend Integration Guide — Career Prediction Dashboard

> **Base API URL:** [https://web-production-3f4dc.up.railway.app](https://web-production-3f4dc.up.railway.app)

This document describes everything a frontend developer needs to build a **clean, professional, responsive dashboard** (HTML/CSS/JS) that integrates with the backend API. The UI design target is **Dashboard SaaS style** (clean admin panel look). Theme supports **Auto (light/dark switch)**.

---

## 1. Project overview

* Single-page dashboard for career prediction & explanation.
* Two input modes: **Form mode** (guided UI) and **JSON mode** (editable demo JSON + run).
* LocalStorage save for last input + last result.
* Clean, minimal UI — no flashy animations; subtle transitions allowed.
* Tech stack (recommended): plain HTML/CSS/JS + Tailwind CSS for styling + Chart.js for charts + small helper libs (optional: Axios or use fetch). Keep dependencies minimal.

---

## 2. Pages / Views

1. **Home / Dashboard**

   * Header (logo, app name, theme toggle)
   * Main layout: left column (input), right column (results)
   * Footer minimal with version + link to docs
2. **Input area (tabbed)**

   * Tab A: Form (grouped sections: Personal, Education, Skills, Projects & Experience, Preferences)
   * Tab B: JSON editor (preloaded demo JSON with a "Run" button)
3. **Results area**

   * Prediction card (role, confidence, bar of class probabilities)
   * Skill gap cards (critical / important / nice-to-have)
   * Learning roadmap (list + small timeline or bullets)
   * Alternatives (list)
   * SHAP / feature importance visualization (simple bar chart)
4. **Settings / Examples**

   * Buttons to load sample profiles (one per role)
   * Clear stored data

---

## 3. Recommended libraries & assets

* **Tailwind CSS** — rapid, consistent styling. Use JIT build if project pipeline exists or CDN for simplicity.
* **Chart.js** — for probability bars, radar or skill-gap charts.
* **Prism.js** (optional) — syntax highlight for JSON editor if not using an editor lib.
* **Simple JSON editor** — you can use a plain `<textarea>` or a lightweight editor like [CodeMirror] (optional). For minimal setup, use `<textarea>` with syntax hint.
* **No heavy frameworks** — do not use React/Vue unless requested. Keep plain JS for simplicity.

CDN suggestions:

```html
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

(If you prefer Tailwind v3 or a build step, adapt accordingly.)

---

## 4. API Endpoints (examples)

Use `fetch` or Axios. All endpoints use POST where appropriate.

### 1) POST `/predict`

**URL:** `https://web-production-3f4dc.up.railway.app/predict`
**Body:** JSON user profile (example later)
**Response:**

```json
{
  "predicted_role": "Frontend Developer",
  "confidence": "20.1%",
  "confidence_score": 0.20099,
  "all_probabilities": {"Frontend Developer":0.20,...}
}
```

### 2) POST `/explain`

**URL:** `https://web-production-3f4dc.up.railway.app/explain`
**Body:** same profile JSON
**Response:** full explanation JSON with `learning_path`, `skill_gaps`, `skills_detected`, `alternative_roles` (as in current server output).

### 3) GET `/roles`

**URL:** `https://web-production-3f4dc.up.railway.app/roles`
Returns list of roles.

### 4) GET `/learning-path/{skill}`

**URL:** `https://web-production-3f4dc.up.railway.app/learning-path/html`
Returns resource entry for the skill.

> All responses are JSON. Handle HTTP errors (4xx/5xx) gracefully and show user-friendly messages.

---

## 5. Input formats

The API expects a comprehensive profile. Provide the frontend with a default demo JSON and a form that maps to the same fields.

### Minimal demo JSON (shortened)

```json
{
  "age":22,
  "gender":"Male",
  "location":"Kolkata",
  "languages_spoken":"English, Bengali",
  "class_10_percentage":85.0,
  "class_12_percentage":80.0,
  "class_12_stream":"Science",
  "graduate_major":"CSE",
  "graduate_cgpa":8.0,
  "pg_major":"None",
  "pg_cgpa":0.0,
  "highest_education":"Bachelors",
  "academic_consistency":0.8,
  "technical_skills":"HTML, CSS, JavaScript, React",
  "soft_skills":"Communication,Teamwork",
  "courses_completed":5,
  "avg_course_difficulty":3,
  "total_hours_learning":120,
  "project_count":3,
  "avg_project_complexity":3,
  "experience_months":6,
  "experience_types":"Internship",
  "job_level":"Entry",
  "interest_stem":0.8,
  "career_preference":"Frontend Developer",
  "work_preference":"Hybrid",
  "preferred_industries":"IT",
  "preferred_roles":"Frontend Developer",
  "conscientiousness":4,
  "extraversion":3,
  "openness":4,
  "agreeableness":3,
  "emotional_stability":4,
  "current_status":"Student"
}
```

**Mapping rule:** Form field `technical_skills` should be a comma-separated string.

---

## 6. LocalStorage schema

Store last input and last explain result.

**Keys:**

* `career:lastInput` → JSON string of last user profile
* `career:lastPredict` → JSON string of last predict response
* `career:lastExplain` → JSON string of last explain response
* `career:theme` → `"light"` | `"dark"` | `"auto"`

**Behavior:**

* On load, if `career:lastInput` exists, populate form and JSON editor.
* After a successful `/predict` or `/explain`, save responses.
* Provide controls: "Save profile" (explicit) and "Auto save" (toggle).

---

## 7. UI component structure (suggested)

* `Header` — logo, title, theme toggle, sample profiles dropdown
* `LeftPane` — Input Card

  * Tabs: `Form` / `JSON`
  * `Form` groups: Personal, Education, Skills, Projects, Experience, Preferences
  * Buttons: `Run Predict`, `Run Explain`, `Save to Local`, `Reset`
* `RightPane` — Results

  * `PredictionCard` — role + progress ring + probability bar chart
  * `SkillGaps` — three columns or accordion for critical/important/nice
  * `LearningRoadmap` — bullet list, show course links (if available)
  * `Alternatives` — list with match scores
  * `SHAPBar` — bar showing top feature impacts (optional)
* `Footer`

**Layout:** two-column on desktop (input 33% / results 67%). Collapse to single column on mobile (input first, results below).

---

## 8. Charts & visualization

* **Probability bar** — horizontal bar (Chart.js) showing all role probabilities sorted.
* **Skill gap chips** — badges for missing vs have.
* **Learning roadmap** — timeline or stacked bullets (simple list ok).
* **Feature importance (SHAP)** — top 6 features bar chart (only if `explain` returns top reasons or SHAP vector).

Accessibility: charts must have alt text or textual summary under charts.

---

## 9. Styling system

* Use Tailwind CSS utility classes.
* Define CSS variables for color tokens to support theme switch.
* Keep spacing, rounded corners `rounded-md`, shadows `shadow-sm` subtle.
* Typography: Inter or system UI font.

**Color tokens (suggested):**

* `--bg`: white (light) / #0b1220 (dark)
* `--card`: #ffffff / #0f1724
* `--muted`: #6b7280 / #9ca3af
* `--accent`: #0ea5a4 (teal) or #2563eb (blue)
* `--success`: #16a34a
* `--danger`: #ef4444

---

## 10. Form UX details

* Use grouped inputs with labels and placeholders.
* For `technical_skills` use a tag input or textarea; parse comma-separated values.
* `Run Predict` should call `/predict` then show result card.
* `Run Explain` should call `/explain` and fill learning roadmap and gaps.
* Loading states: show spinner in button (no heavy animations).
* Error states: show concise message and copyable error details for debugging.

---

## 11. JSON Editor UX

* Show a pretty-printed JSON textarea prefilled with demo JSON.
* Validate JSON before sending. If invalid, show inline error.
* "Load to form" button to parse JSON and populate form fields.

---

## 12. Example fetch (vanilla JS)

```js
async function callPredict(profile){
  const res = await fetch('https://web-production-3f4dc.up.railway.app/predict',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(profile)
  });
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}
```

---

## 13. Sample profiles (deliver to developer)

Include one sample JSON per role (7 total). Provide these as quick-load buttons in the UI.

---

## 14. Testing checklist for frontend dev

* [ ] Form maps to API fields exactly
* [ ] JSON editor validates and reloads form
* [ ] LocalStorage keys persist across reloads
* [ ] Predict + Explain both work and responses render
* [ ] Mobile responsive (breakpoint <= 768px)
* [ ] Accessibility labels present
* [ ] Error messages displayed for API failures

---

## 15. Deliverables & acceptance criteria

1. **HTML/CSS/JS app** that runs from static files (no build required) and works with the given base API URL.
2. Clean responsive UI matching the design spec.
3. LocalStorage save & load implemented.
4. Two input modes (form + JSON) with demo JSON templates.
5. Charts for probability and feature importance.
6. Well-documented code and README for developer handoff.

Acceptance: send ZIP with `index.html`, `styles.css`, `app.js`, `assets/`, and `README.md`. The app must work by opening `index.html` in a browser (CORS rules may require running a static server for API calls; mention in README).

---

## 16. Optional / Future improvements (nice-to-have)

* Use CodeMirror for a better JSON UX.
* Add OAuth or API key protection for production.
* Implement server-side rendering / React SPA for more features.
* Save multiple profiles with titles in LocalStorage.

---

## 17. Contact & notes for developer

* API base URL: `https://web-production-3f4dc.up.railway.app`
* If CORS issues appear, either run the frontend on a small local server (e.g., `npx http-server`) or request backend to allow the origin.
* Keep UI minimal and professional; avoid decorative animations.

---