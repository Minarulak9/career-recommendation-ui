# AI Model Prompt Guide for Frontend Integration

This document provides a **complete, production-ready prompt specification** for interacting with the Career Prediction AI model **via API calls only**. No backend logic is required. The frontend will:

1. Collect user input
2. Store user input in `localStorage`
3. Send the data to the model API endpoint
4. Receive structured JSON responses
5. Render the results

---

# 1. Base API Information

**Base URL:**

```
https://web-production-3f4dc.up.railway.app
```

All requests must be sent as:

```
POST
Content-Type: application/json
```

---

# 2. General Prompt Structure

Every call to `/predict` or `/explain` must contain a JSON object following **this schema**:

```json
{
  "age": 22,
  "gender": "Male",
  "location": "Kolkata",
  "languages_spoken": "English, Bengali",

  "class_10_percentage": 85,
  "class_12_percentage": 80,
  "class_12_stream": "Science",

  "graduate_major": "CSE",
  "graduate_cgpa": 8.2,
  "pg_major": "None",
  "pg_cgpa": 0,
  "highest_education": "Bachelors",

  "academic_consistency": 0.8,

  "technical_skills": "HTML, CSS, JavaScript, React",
  "tech_skill_proficiency": 0.7,

  "soft_skills": "Communication, Teamwork",
  "soft_skill_proficiency": 0.7,

  "courses_completed": 5,
  "avg_course_difficulty": 3,
  "total_hours_learning": 120,

  "project_count": 3,
  "avg_project_complexity": 3,

  "experience_months": 6,
  "experience_types": "Internship",
  "job_level": "Entry",

  "interest_stem": 0.8,
  "interest_business": 0.4,
  "interest_arts": 0.1,
  "interest_design": 0.3,
  "interest_medical": 0.1,
  "interest_social_science": 0.2,

  "career_preference": "Frontend Developer",
  "work_preference": "Hybrid",
  "preferred_industries": "IT",
  "preferred_roles": "Frontend Developer",

  "conscientiousness": 4,
  "extraversion": 3,
  "openness": 4,
  "agreeableness": 3,
  "emotional_stability": 4,

  "current_status": "Student"
}
```

---

# 3. Prompt for `/predict` API

### Endpoint:

```
POST /predict
```
{
  "age": 0,
  "gender": "string",
  "location": "string",
  "languages_spoken": "string",
  "class_10_percentage": 0,
  "class_12_percentage": 0,
  "class_12_stream": "string",
  "graduate_major": "string",
  "graduate_cgpa": 0,
  "pg_major": "string",
  "pg_cgpa": 0,
  "highest_education": "string",
  "academic_consistency": 0.7,
  "technical_skills": "string",
  "tech_skill_proficiency": 0.7,
  "soft_skills": "string",
  "soft_skill_proficiency": 0.7,
  "courses_completed": 0,
  "avg_course_difficulty": 0,
  "total_hours_learning": 0,
  "project_count": 0,
  "avg_project_complexity": 0,
  "experience_months": 0,
  "experience_types": "string",
  "job_level": "string",
  "interest_stem": 0,
  "interest_business": 0,
  "interest_arts": 0,
  "interest_design": 0,
  "interest_medical": 0,
  "interest_social_science": 0,
  "career_preference": "string",
  "work_preference": "string",
  "preferred_industries": "string",
  "preferred_roles": "string",
  "conscientiousness": 0,
  "extraversion": 0,
  "openness": 0,
  "agreeableness": 0,
  "emotional_stability": 0,
  "current_status": "string"
}

### Expected Response Format:

```json
{
  "predicted_role": "Frontend Developer",
  "confidence": "20.1%",
  "confidence_score": 0.200991,
  "all_probabilities": {
    "Frontend Developer": 0.20,
    "Project Manager": 0.18,
    "AI Engineer": 0.13,
    "Data Analyst": 0.13,
    "Backend Developer": 0.11,
    "Software Engineer": 0.11,
    "UX Designer": 0.10
  }
}
```

---

# 4. Prompt for `/explain` API

### Endpoint:

```
POST /explain
```

Same as predict.

### Expected Response Format:

```json
{
  "summary": {
    "role": "Project Manager",
    "confidence": "25.1%",
    "match_score": "0%",
    "seniority": "Beginner"
  },
  "skills_detected": [
    "string"
  ],
  "skill_gaps": {
    "critical": {
      "have": [],
      "missing": [
        "communication",
        "stakeholder management",
        "roadmap"
      ]
    },
    "important": {
      "have": [],
      "missing": [
        "product strategy",
        "user research",
        "prioritization"
      ]
    },
    "nice_to_have": {
      "have": [],
      "missing": [
        "analytics",
        "okrs",
        "wireframing",
        "agile"
      ]
    }
  },
  "learning_path": {
    "roadmap": [
      {
        "skill": "communication",
        "courses": [
          "Technical Communication (Coursera)",
          "Toastmasters resources"
        ],
        "projects": [
          "Prepare a project demo video & write docs"
        ],
        "duration": "1 month",
        "difficulty": "Beginner"
      },
      {
        "skill": "stakeholder management",
        "courses": [
          "Official documentation",
          "YouTube guided playlist"
        ],
        "projects": [
          "Build a small practical project"
        ],
        "duration": "1–2 months",
        "difficulty": "Intermediate"
      },
      {
        "skill": "roadmap",
        "courses": [
          "Official documentation",
          "YouTube guided playlist"
        ],
        "projects": [
          "Build a small practical project"
        ],
        "duration": "1–2 months",
        "difficulty": "Intermediate"
      },
      {
        "skill": "product strategy",
        "courses": [
          "Product Management basics (Coursera)"
        ],
        "projects": [
          "Write a product spec for your flagship project"
        ],
        "duration": "1 month",
        "difficulty": "Intermediate"
      },
      {
        "skill": "user research",
        "courses": [
          "Official documentation",
          "YouTube guided playlist"
        ],
        "projects": [
          "Build a small practical project"
        ],
        "duration": "1–2 months",
        "difficulty": "Intermediate"
      },
      {
        "skill": "prioritization",
        "courses": [
          "Official documentation",
          "YouTube guided playlist"
        ],
        "projects": [
          "Build a small practical project"
        ],
        "duration": "1–2 months",
        "difficulty": "Intermediate"
      }
    ],
    "effort_required": "Significant (4–6 months)",
    "recommended_project": "Build a portfolio project"
  },
  "alternative_roles": [
    {
      "role": "Software Engineer",
      "match_score": "0%"
    },
    {
      "role": "Frontend Developer",
      "match_score": "0%"
    },
    {
      "role": "Backend Developer",
      "match_score": "0%"
    }
  ]
}
```

---

# 5. Frontend → Model Prompt Rules

### Rule 1 — Always send complete JSON

Do **not omit fields**. The AI model expects a fixed schema.

### Rule 2 — Skills must be comma-separated strings

Example:

```
"technical_skills": "HTML, CSS, JS, React"
```

### Rule 3 — Convert all number inputs to numbers

Bad:

```
"experience_months": "6"
```

Good:

```
"experience_months": 6
```

### Rule 4 — Save user input to localStorage

Keys:

```
career:lastInput
career:lastPredict
career:lastExplain
career:theme
```

### Rule 5 — When rendering results, always parse using `JSON.parse`.

Example:

```js
const explain = JSON.parse(localStorage.getItem("career:lastExplain"));
```


# 7. JSON Templates For Frontend Buttons

Provide demo buttons in UI:

### "Load Frontend Developer Sample"

### "Load Data Analyst Sample"

### "Load AI Engineer Sample"

### "Load Software Engineer Sample"

### "Load Backend Developer Sample"

### "Load UX Designer Sample"

### "Load Project Manager Sample"

Each should load a valid profile JSON.

---

# 8. Error Handling Prompts

When API fails, show:

```json
{
  "error": true,
  "message": "Unable to process request",
  "details": "<error text>"
}
```

---

# 9. UI Prompt Guidelines

### For form input fields:

Show placeholder text like:

* "Enter comma-separated skills"
* "Enter CGPA (0–10)"
* "Enter experience in months"

### For JSON editor mode:

Show instructions:

```
Modify the JSON below or run directly. Ensure valid JSON format.
```

---

# 10. Final Prompt (For Frontend Developer)

**Your job is to:**

* Build a clean, responsive UI that collects user data.
* use html, css, js and other library for deisgn and functionality (give me files one by one seperate with folder structre)
* Provide both Form and JSON input modes.
* Store all inputs and outputs in localStorage.
* Send all requests to the provided API.
* Render all JSON responses cleanly.
* Support dark/light/auto themes.

**Absolutely no backend code is required.**

