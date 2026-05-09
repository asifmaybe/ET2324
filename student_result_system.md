# Student Result System — Individual Dashboard Implementation Guide

## Overview

This document describes the full logic and data structure for implementing a per-student result dashboard. Every student sees only their own result. The system must be **scalable**: publishing a new semester result automatically updates all previous semester statuses (referred subjects may be cleared in later semesters).

The UI shows semester cards stacked newest-to-oldest, with a top banner showing total pending subjects, and each card showing the semester status badge, publish date, GPA box (if applicable), and list of referred subjects.

---

## Core Concepts

### Semester States

Each semester card can be in one of three states:

| State | Condition | Display |
|---|---|---|
| `passed` | GPA exists AND all referred subjects cleared | Green "✓ Passed" badge |
| `has_refs` | One or more referred subjects still uncleared | Red "⊗ X subjects yet to pass" badge |
| `missing` | Result published but no GPA (absent/withheld) | Grey "Missing Result" badge |

### What "Referred" Means

A **referred subject** is one the student failed in a given semester. It is considered **cleared** only when the student passes it in a later semester attempt. Until cleared, it accumulates in the "Total Yet to Pass" count.

### Cumulative Pending Logic (Critical)

The "Total Yet to Pass" is **not** just the count from the latest semester. It is the count of **all referred subjects across all semesters that have not been cleared in any subsequent semester**.

---

## Data Model

### `semester_results` table

```
semester_result {
  id
  roll_no           // student identifier
  semester_number   // 1, 2, 3, 4, ...
  gpa               // null if missing result
  published_at      // date result was published
  is_missing        // boolean — true if no result (absent/withheld)
}
```

### `referred_subjects` table

```
referred_subject {
  id
  roll_no
  semester_number      // semester in which the subject was first failed
  subject_code         // e.g. "25841"
  subject_name         // e.g. "Accounting"
  subject_type         // "Theory" | "Practical" | "Theory & Practical"
  cleared_in_semester  // null if still pending; semester_number when passed
}
```

### `published_semesters` table

```
published_semester {
  semester_number
  published_at
}
```

---

## Core Logic Rules

### Rule 1 — Semester Card Status

```
if is_missing == true:
  state = "missing"
elif COUNT(referred_subjects for this semester WHERE cleared_in_semester IS NULL) > 0:
  state = "has_refs"
else:
  state = "passed"
```

Note: A semester with a GPA AND referred subjects shows both — GPA and refs are not mutually exclusive.

### Rule 2 — Clearing Referred Subjects (Run on Every New Publish)

When Semester N is published:

```
For each referred_subject WHERE cleared_in_semester IS NULL:
  If subject_code was passed in Semester N:
    SET cleared_in_semester = N
```

"Passed in Semester N" means the subject was attempted and does NOT appear in Semester N's referred list.

### Rule 3 — Total Yet to Pass

```
total_yet_to_pass = COUNT(referred_subjects)
  WHERE roll_no = current_student
  AND cleared_in_semester IS NULL
```

### Rule 4 — Per-Semester Badge Count

```
sem_pending_count = COUNT(referred_subjects)
  WHERE roll_no = current_student
  AND semester_number = this_semester
  AND cleared_in_semester IS NULL
```

If sem_pending_count == 0 but refs existed originally → card shows "✓ Passed".

### Rule 5 — New Semester Publish Workflow

1. Insert `semester_result` for each student.
2. Insert `referred_subject` records for each failed subject.
3. Run Rule 2 — mark any prior uncleared refs that were passed this semester.
4. Dashboard renders correctly from fresh queries — no manual recalculation needed.

---

## UI Rendering Logic (Per Student)

### Top Banner

```
total_yet_to_pass > 0  →  red banner:   "{N} subjects yet to pass"
total_yet_to_pass == 0 →  green banner: "All Passed ✓"
no results published   →  hide banner
```

### Semester Cards (newest to oldest)

```
CARD HEADER:
  Left:  "🎓 {N}th Semester"  (correct ordinal: 1st, 2nd, 3rd, 4th...)
  Right: Status Badge

STATUS BADGE:
  "passed"   → green  "✓ Passed"
  "has_refs" → red    "⊗ {sem_pending_count} subjects yet to pass"
  "missing"  → grey   "Missing Result"

DATE ROW:
  "Published: {published_at}"    e.g. "28 April, 2026"
  Right-aligned: relative time   e.g. "11 days ago"

GPA BOX (only if gpa is not null):
  Shaded/highlighted box: "GPA  {gpa}"

REFERRED SUBJECTS LIST:
  Show ALL originally referred subjects for this semester (cleared or not).
  Each row: {subject_code}   {subject_name}   [{subject_type}]

  Style cleared subjects differently (optional):
    pending → normal/red color
    cleared → muted color, strikethrough, or "Cleared" label
```

### Subject Row Format

```
{subject_code}   {subject_name}   [{subject_type}]

Examples:
25841   Accounting                                        [Theory]
26741   Electrical Installation, Planning and Estimating  [Theory]
26833   Industrial Electronics                            [Theory]
```

---

## Key Implementation Notes

- **Missing Result vs not published**: `is_missing = true` → show "Missing Result" card. No record at all → semester not published yet → no card.
- **Always show referred subject history**: Never hide cleared subjects. Full history must always be visible.
- **Total Yet to Pass — always query directly**: Never sum per-semester badge counts. Always use `WHERE cleared_in_semester IS NULL`.
- **GPA and refs are not mutually exclusive**: Show both GPA box and subject list when both exist.
- **Ordinal formatting**: 1 → 1st, 2 → 2nd, 3 → 3rd, 4 → 4th, 5 → 5th...
- **Date format**: `"28 April, 2026"` absolute + relative time (`"11 days ago"`).
- **Access control**: Every query must be scoped to the logged-in student's `roll_no` at the API/database level.

### Data Fetch per Dashboard Load

```
1. published_semesters              → which semesters exist + publish dates
2. semester_results (this student)  → gpa, is_missing, published_at per semester
3. referred_subjects (this student) → code, name, type, semester_number, cleared_in_semester
```

Derive at render time: `total_yet_to_pass`, `sem_pending_count`, and card `state`.

---

## Subject Code Reference

All subject codes and names across all 8 semesters.

### 1st Semester

| Code | Subject Name |
|---|---|
| 21011 | Engineering Drawing |
| 25711 | Bangla-I |
| 25712 | English-I |
| 25812 | Physical Education & Life Skills Development |
| 25911 | Mathematics-I |
| 25912 | Physics-I |
| 26711 | Basic Electricity |
| 26712 | Electrical Engineering Materials |

### 2nd Semester

| Code | Subject Name |
|---|---|
| 25721 | Bangla-II |
| 25722 | English-II |
| 25921 | Mathematics-II |
| 25922 | Physics-II |
| 26721 | Electrical Circuits-I |
| 26722 | Electrical Engineering Drawing |
| 26811 | Basic Electronics |

### 3rd Semester

| Code | Subject Name |
|---|---|
| 25931 | Mathematics-III |
| 25913 | Chemistry |
| 28511 | Computer Office Application |
| 26731 | Electrical Circuits-II |
| 26732 | Electrical Appliances |
| 26833 | Industrial Electronics |

### 4th Semester

| Code | Subject Name |
|---|---|
| 25811 | Social Science |
| 25841 | Accounting |
| 26741 | Electrical Installation, Planning and Estimating |
| 26742 | DC Machine |
| 26743 | Electrical Engineering Project-I |
| 26845 | Digital Electronics |
| 27044 | Applied Mechanics |

### 5th Semester

| Code | Subject Name |
|---|---|
| 25851 | Principles of Marketing |
| 25852 | Industrial Management |
| 26751 | Generation of Electrical Power |
| 26752 | Electrical & Electronic Measurements-I |
| 26753 | Testing and Maintenance of Electrical Equipments |
| 26754 | Electrical Engineering Project-II |
| 26853 | Microprocessor & Microcontroller |

### 6th Semester

| Code | Subject Name |
|---|---|
| 28567 | Programming in C |
| 26761 | AC Machine-I |
| 26762 | Transmission and Distribution of Electrical Power-I |
| 26763 | Electrical & Electronic Measurements-II |
| 26842 | Communication Engineering |
| 29041 | Environmental Studies |

### 7th Semester

| Code | Subject Name |
|---|---|
| 25831 | Business Communication |
| 25853 | Innovation & Entrepreneurship |
| 26771 | AC Machine-II |
| 26772 | Transmission and Distribution of Electrical Power-II |
| 26773 | Switch Gear and Protection |
| 26774 | Electrical Engineering Project-III |
| 26875 | Automation Engineering & PLC |

### 8th Semester

| Code | Subject Name |
|---|---|
| 26781 | Industrial Attachment & Project Presentation |

---

## All Student Individual Results (Seed / Reference Data)

The data below represents the current state of all student results after 4 semesters have been published. Use this to seed your database and validate your rendering logic.

Each student block shows:
- **Top line**: total subjects still pending (if any), or "All Passed"
- **Per semester**: GPA (if available), referred subjects with their originating semester, and current cleared/pending status

> Legend:
> - `[Xth]` after a subject name = the semester in which it was first referred
> - `✓ Passed` on a semester = all refs from that semester are now cleared
> - `⊗ N yet to pass` on a semester = N refs from that semester are still pending
> - `Missing Result` = result was published but student has no GPA

---

### Roll 842943 — All Passed ✓

**Total yet to pass: 0**

| Semester | GPA | Status |
|---|---|---|
| 1st Semester | 3.81 | ✓ Passed |
| 2nd Semester | 3.65 | ✓ Passed |
| 3rd Semester | 3.90 | ✓ Passed |
| 4th Semester | 3.75 | ✓ Passed |

No referred subjects.

---

### Roll 842944 — ⊗ 7 Subjects Yet to Pass

**Total yet to pass: 7**

| Semester | GPA | Status | Referred Subjects (from this sem, still pending) |
|---|---|---|---|
| 1st Semester | 3.23 | ✓ Passed | — |
| 2nd Semester | Missing Result | Missing Result | — |
| 3rd Semester | — | ⊗ 3 yet to pass | 25913 Chemistry [2nd→3rd] · 25921 Mathematics-II [2nd] · 26721 Electrical Circuits-I [2nd] |
| 4th Semester | — | ⊗ 7 yet to pass | 25841 Accounting [4th] · 25913 Chemistry [3rd] · 25921 Mathematics-II [2nd] · 26721 Electrical Circuits-I [2nd] · 26741 Electrical Installation Planning and Estimating [4th] · 26845 Digital Electronics [4th] · 27044 Applied Mechanics [4th] |

**Referred subjects (all, with originating semester):**

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25913 | Chemistry | Theory | 3rd Sem | Pending |
| 25921 | Mathematics-II | Theory | 2nd Sem | Pending |
| 26721 | Electrical Circuits-I | Theory | 2nd Sem | Pending |
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation Planning and Estimating | Theory | 4th Sem | Pending |
| 26845 | Digital Electronics | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 842945 — ⊗ 1 Subject Yet to Pass

**Total yet to pass: 1**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.43 | ✓ Passed | — |
| 2nd Semester | 2.75 | ✓ Passed | — |
| 3rd Semester | 2.99 | ✓ Passed | — |
| 4th Semester | — | ⊗ 1 yet to pass | 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 842946 — ⊗ 2 Subjects Yet to Pass

**Total yet to pass: 2**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.57 | ✓ Passed | — |
| 2nd Semester | 3.41 | ✓ Passed | — |
| 3rd Semester | 3.20 | ✓ Passed | — |
| 4th Semester | — | ⊗ 2 yet to pass | 25841 Accounting [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 842949 — All Passed ✓

**Total yet to pass: 0**

| Semester | GPA | Status |
|---|---|---|
| 1st Semester | 3.85 | ✓ Passed |
| 2nd Semester | 3.74 | ✓ Passed |
| 3rd Semester | 3.74 | ✓ Passed |
| 4th Semester | 3.44 | ✓ Passed |

No referred subjects.

---

### Roll 842950 — ⊗ 9 Subjects Yet to Pass

**Total yet to pass: 9**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.06 | ✓ Passed | — |
| 2nd Semester | Missing Result | Missing Result | — |
| 3rd Semester | — | ⊗ 5 yet to pass | 25913 Chemistry [3rd] · 25921 Mathematics-II [2nd] · 26721 Electrical Circuits-I [2nd] · 26811 Basic Electronics [2nd] · 26833 Industrial Electronics [3rd] |
| 4th Semester | — | ⊗ 9 yet to pass | 25841 Accounting [4th] · 25913 Chemistry [3rd] · 25921 Mathematics-II [2nd] · 26721 Electrical Circuits-I [2nd] · 26741 Electrical Installation Planning and Estimating [4th] · 26811 Basic Electronics [2nd] · 26833 Industrial Electronics [3rd] · 26845 Digital Electronics [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25913 | Chemistry | Theory | 3rd Sem | Pending |
| 25921 | Mathematics-II | Theory | 2nd Sem | Pending |
| 26721 | Electrical Circuits-I | Theory | 2nd Sem | Pending |
| 26811 | Basic Electronics | Theory | 2nd Sem | Pending |
| 26833 | Industrial Electronics | Theory | 3rd Sem | Pending |
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation Planning and Estimating | Theory | 4th Sem | Pending |
| 26845 | Digital Electronics | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 842951 — All Passed ✓

**Total yet to pass: 0**

| Semester | GPA | Status |
|---|---|---|
| 1st Semester | 3.63 | ✓ Passed |
| 2nd Semester | 3.44 | ✓ Passed |
| 3rd Semester | 3.65 | ✓ Passed |
| 4th Semester | 3.27 | ✓ Passed |

No referred subjects.

---

### Roll 842954 — All Passed ✓

**Total yet to pass: 0**

| Semester | GPA | Status |
|---|---|---|
| 1st Semester | 3.95 | ✓ Passed |
| 2nd Semester | 3.90 | ✓ Passed |
| 3rd Semester | 3.96 | ✓ Passed |
| 4th Semester | 3.80 | ✓ Passed |

No referred subjects.

---

### Roll 842955 — ⊗ 3 Subjects Yet to Pass

**Total yet to pass: 3**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.17 | ✓ Passed | — |
| 2nd Semester | 2.57 | ✓ Passed | — |
| 3rd Semester | — | ⊗ 1 yet to pass | 25913 Chemistry [3rd] |
| 4th Semester | — | ⊗ 3 yet to pass | 25913 Chemistry [3rd] · 26741 Electrical Installation, Planning and Estimating [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25913 | Chemistry | Theory | 3rd Sem | Pending |
| 26741 | Electrical Installation, Planning and Estimating | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 842956 — All Passed ✓

**Total yet to pass: 0**

| Semester | GPA | Status |
|---|---|---|
| 1st Semester | 3.83 | ✓ Passed |
| 2nd Semester | 3.81 | ✓ Passed |
| 3rd Semester | 3.64 | ✓ Passed |
| 4th Semester | 3.08 | ✓ Passed |

No referred subjects.

---

### Roll 842957 — ⊗ 5 Subjects Yet to Pass

**Total yet to pass: 5**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 2.96 | ✓ Passed | — |
| 2nd Semester | — | Missing Result | — |
| 3rd Semester | — | ⊗ 2 yet to pass | 26721 Electrical Circuits-I [2nd] · 26731 Electrical Circuits-II [3rd] |
| 4th Semester | — | ⊗ 5 yet to pass | 25841 Accounting [4th] · 26721 Electrical Circuits-I [2nd] · 26731 Electrical Circuits-II [3rd] · 26741 Electrical Installation Planning and Estimating [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 26721 | Electrical Circuits-I | Theory | 2nd Sem | Pending |
| 26731 | Electrical Circuits-II | Theory | 3rd Sem | Pending |
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation Planning and Estimating | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 842959 — ⊗ 7 Subjects Yet to Pass

**Total yet to pass: 7**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | — | Missing Result | — |
| 2nd Semester | — | ⊗ 1 yet to pass | 25911 Mathematics-I [1st] |
| 3rd Semester | — | ⊗ 4 yet to pass | 25911 Mathematics-I [1st] · 25913 Chemistry [3rd] · 25921 Mathematics-II [2nd] · 26833 Industrial Electronics [3rd] |
| 4th Semester | — | ⊗ 7 yet to pass | 25841 Accounting [4th] · 25911 Mathematics-I [1st] · 25913 Chemistry [3rd] · 25921 Mathematics-II [2nd] · 26741 Electrical Installation Planning and Estimating [4th] · 26833 Industrial Electronics [3rd] · 26845 Digital Electronics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25911 | Mathematics-I | Theory | 1st Sem | Pending |
| 25913 | Chemistry | Theory | 3rd Sem | Pending |
| 25921 | Mathematics-II | Theory | 2nd Sem | Pending |
| 26833 | Industrial Electronics | Theory | 3rd Sem | Pending |
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation Planning and Estimating | Theory | 4th Sem | Pending |
| 26845 | Digital Electronics | Theory | 4th Sem | Pending |

---

### Roll 842961 — ⊗ 2 Subjects Yet to Pass

**Total yet to pass: 2**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.51 | ✓ Passed | — |
| 2nd Semester | 2.80 | ✓ Passed | — |
| 3rd Semester | — | ⊗ 1 yet to pass | 25913 Chemistry [3rd] |
| 4th Semester | — | ⊗ 2 yet to pass | 25841 Accounting [4th] · 25913 Chemistry [3rd] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25913 | Chemistry | Theory | 3rd Sem | Pending |
| 25841 | Accounting | Theory | 4th Sem | Pending |

---

### Roll 842962 — ⊗ 3 Subjects Yet to Pass

**Total yet to pass: 3**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.24 | ✓ Passed | — |
| 2nd Semester | 2.74 | ✓ Passed | — |
| 3rd Semester | 2.81 | ✓ Passed | — |
| 4th Semester | — | ⊗ 3 yet to pass | 25841 Accounting [4th] · 26741 Electrical Installation Planning and Estimating [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation Planning and Estimating | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 842963 — ⊗ 4 Subjects Yet to Pass

**Total yet to pass: 4**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.08 | ✓ Passed | — |
| 2nd Semester | 2.89 | ✓ Passed | — |
| 3rd Semester | 2.90 | ✓ Passed | — |
| 4th Semester | — | ⊗ 4 yet to pass | 25841 Accounting [4th] · 26741 Electrical Installation Planning and Estimating [4th] · 26845 Digital Electronics [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation Planning and Estimating | Theory | 4th Sem | Pending |
| 26845 | Digital Electronics | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 842965 — ⊗ 4 Subjects Yet to Pass

**Total yet to pass: 4**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 2.87 | ✓ Passed | — |
| 2nd Semester | 2.20 | ✓ Passed | 25921 Mathematics-II [2nd] → Cleared in 3rd Sem |
| 3rd Semester | — | ✓ Passed | 26833 Industrial Electronics [3rd] → Cleared in 4th Sem |
| 4th Semester | — | ⊗ 4 yet to pass | 25841 Accounting [4th] · 26741 Electrical Installation Planning and Estimating [4th] · 26845 Digital Electronics [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25921 | Mathematics-II | Theory | 2nd Sem | Cleared in 3rd Sem |
| 26833 | Industrial Electronics | Theory | 3rd Sem | Cleared in 4th Sem |
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation Planning and Estimating | Theory | 4th Sem | Pending |
| 26845 | Digital Electronics | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 842967 — ⊗ 3 Subjects Yet to Pass

**Total yet to pass: 3**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.12 | ✓ Passed | — |
| 2nd Semester | 2.81 | ✓ Passed | — |
| 3rd Semester | — | ⊗ 1 yet to pass | 26731 Electrical Circuits-II [3rd] |
| 4th Semester | — | ⊗ 3 yet to pass | 25841 Accounting [4th] · 26731 Electrical Circuits-II [3rd] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 26731 | Electrical Circuits-II | Theory | 3rd Sem | Pending |
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 842969 — ⊗ 2 Subjects Yet to Pass

**Total yet to pass: 2**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.25 | ✓ Passed | — |
| 2nd Semester | 3.24 | ✓ Passed | — |
| 3rd Semester | 3.08 | ✓ Passed | — |
| 4th Semester | — | ⊗ 2 yet to pass | 25841 Accounting [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 842974 — ⊗ 4 Subjects Yet to Pass

**Total yet to pass: 4**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 2.81 | ✓ Passed | — |
| 2nd Semester | 2.39 | ✓ Passed | — |
| 3rd Semester | 2.89 | ✓ Passed | — |
| 4th Semester | — | ⊗ 4 yet to pass | 25841 Accounting [4th] · 26741 Electrical Installation, Planning and Estimating [4th] · 26845 Digital Electronics [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation, Planning and Estimating | Theory | 4th Sem | Pending |
| 26845 | Digital Electronics | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 842977 — ⊗ 4 Subjects Yet to Pass

**Total yet to pass: 4**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 2.98 | ✓ Passed | — |
| 2nd Semester | 2.55 | ✓ Passed | — |
| 3rd Semester | 2.90 | ✓ Passed | — |
| 4th Semester | — | ⊗ 4 yet to pass | 25841 Accounting [4th] · 26741 Electrical Installation, Planning and Estimating [4th] · 26845 Digital Electronics [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation, Planning and Estimating | Theory | 4th Sem | Pending |
| 26845 | Digital Electronics | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 842980 — ⊗ 6 Subjects Yet to Pass

**Total yet to pass: 6**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | — | Missing Result | — |
| 2nd Semester | — | Missing Result | — |
| 3rd Semester | 2.81 | ✓ Passed | — |
| 4th Semester | — | ⊗ 6 yet to pass | 25841 Accounting [4th] · 25912 Physics-I [1st] · 25922 Physics-II [2nd] · 26721 Electrical Circuits-I [2nd] · 26741 Electrical Installation, Planning and Estimating [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25912 | Physics-I | Theory | 1st Sem | Pending |
| 25922 | Physics-II | Theory | 2nd Sem | Pending |
| 26721 | Electrical Circuits-I | Theory | 2nd Sem | Pending |
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation, Planning and Estimating | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 842981 — All Passed ✓

**Total yet to pass: 0**

| Semester | GPA | Status |
|---|---|---|
| 1st Semester | 3.32 | ✓ Passed |
| 2nd Semester | 2.97 | ✓ Passed |
| 3rd Semester | 3.04 | ✓ Passed |
| 4th Semester | 3.05 | ✓ Passed |

No referred subjects.

---

### Roll 842984 — All Passed ✓

**Total yet to pass: 0**

| Semester | GPA | Status |
|---|---|---|
| 1st Semester | 3.69 | ✓ Passed |
| 2nd Semester | 3.85 | ✓ Passed |
| 3rd Semester | 3.54 | ✓ Passed |
| 4th Semester | 3.30 | ✓ Passed |

No referred subjects.

---

### Roll 842985 — ⊗ 5 Subjects Yet to Pass

**Total yet to pass: 5**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.08 | ✓ Passed | — |
| 2nd Semester | 3.07 | ✓ Passed | — |
| 3rd Semester | — | ⊗ 2 yet to pass | 25913 Chemistry [3rd] · 25931 Mathematics-III [3rd] |
| 4th Semester | — | ⊗ 5 yet to pass | 25841 Accounting [4th] · 25913 Chemistry [3rd] · 25931 Mathematics-III [3rd] · 26741 Electrical Installation Planning and Estimating [4th] · 26845 Digital Electronics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25913 | Chemistry | Theory | 3rd Sem | Pending |
| 25931 | Mathematics-III | Theory | 3rd Sem | Pending |
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation Planning and Estimating | Theory | 4th Sem | Pending |
| 26845 | Digital Electronics | Theory | 4th Sem | Pending |

---

### Roll 842986 — ⊗ 1 Subject Yet to Pass

**Total yet to pass: 1**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.07 | ✓ Passed | — |
| 2nd Semester | 3.22 | ✓ Passed | — |
| 3rd Semester | 3.18 | ✓ Passed | — |
| 4th Semester | — | ⊗ 1 yet to pass | 25841 Accounting [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25841 | Accounting | Theory | 4th Sem | Pending |

---

### Roll 842987 — All Passed ✓

**Total yet to pass: 0**

| Semester | GPA | Status |
|---|---|---|
| 1st Semester | 3.17 | ✓ Passed |
| 2nd Semester | 3.17 | ✓ Passed |
| 3rd Semester | 3.10 | ✓ Passed |
| 4th Semester | 2.76 | ✓ Passed |

No referred subjects.

---

### Roll 842988 — ⊗ 1 Subject Yet to Pass

**Total yet to pass: 1**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.23 | ✓ Passed | — |
| 2nd Semester | 2.48 | ✓ Passed | — |
| 3rd Semester | 3.14 | ✓ Passed | — |
| 4th Semester | — | ⊗ 1 yet to pass | 25841 Accounting [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25841 | Accounting | Theory | 4th Sem | Pending |

---

### Roll 842991 — ⊗ 1 Subject Yet to Pass

**Total yet to pass: 1**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.67 | ✓ Passed | — |
| 2nd Semester | 3.57 | ✓ Passed | — |
| 3rd Semester | 3.31 | ✓ Passed | — |
| 4th Semester | — | ⊗ 1 yet to pass | 25841 Accounting [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25841 | Accounting | Theory | 4th Sem | Pending |

---

### Roll 842992 — ⊗ 4 Subjects Yet to Pass

**Total yet to pass: 4**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.13 | ✓ Passed | — |
| 2nd Semester | 2.74 | ✓ Passed | — |
| 3rd Semester | — | ⊗ 2 yet to pass | 25913 Chemistry [3rd] · 26833 Industrial Electronics [3rd] |
| 4th Semester | — | ⊗ 4 yet to pass | 25841 Accounting [4th] · 25913 Chemistry [3rd] · 26833 Industrial Electronics [3rd] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25913 | Chemistry | Theory | 3rd Sem | Pending |
| 26833 | Industrial Electronics | Theory | 3rd Sem | Pending |
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 842996 — All Passed ✓

**Total yet to pass: 0**

| Semester | GPA | Status |
|---|---|---|
| 1st Semester | 3.33 | ✓ Passed |
| 2nd Semester | 3.82 | ✓ Passed |
| 3rd Semester | 3.60 | ✓ Passed |
| 4th Semester | 3.65 | ✓ Passed |

No referred subjects.

---

### Roll 842999 — ⊗ 3 Subjects Yet to Pass

**Total yet to pass: 3**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.26 | ✓ Passed | — |
| 2nd Semester | 2.99 | ✓ Passed | — |
| 3rd Semester | 3.15 | ✓ Passed | — |
| 4th Semester | — | ⊗ 3 yet to pass | 25841 Accounting [4th] · 26741 Electrical Installation, Planning and Estimating [4th] · 26845 Digital Electronics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation, Planning and Estimating | Theory | 4th Sem | Pending |
| 26845 | Digital Electronics | Theory | 4th Sem | Pending |

---

### Roll 843001 — ⊗ 4 Subjects Yet to Pass

**Total yet to pass: 4**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.10 | ✓ Passed | — |
| 2nd Semester | 2.63 | ✓ Passed | — |
| 3rd Semester | — | ⊗ 1 yet to pass | 25913 Chemistry [3rd] |
| 4th Semester | — | ⊗ 4 yet to pass | 25841 Accounting [4th] · 25913 Chemistry [3rd] · 26741 Electrical Installation, Planning and Estimating [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25913 | Chemistry | Theory | 3rd Sem | Pending |
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation, Planning and Estimating | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 843003 — ⊗ 2 Subjects Yet to Pass

**Total yet to pass: 2**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.04 | ✓ Passed | — |
| 2nd Semester | 2.69 | ✓ Passed | — |
| 3rd Semester | 2.95 | ✓ Passed | — |
| 4th Semester | — | ⊗ 2 yet to pass | 25841 Accounting [4th] · 26741 Electrical Installation, Planning and Estimating [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation, Planning and Estimating | Theory | 4th Sem | Pending |

---

### Roll 843008 — ⊗ 1 Subject Yet to Pass

**Total yet to pass: 1**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 2.90 | ✓ Passed | — |
| 2nd Semester | 2.67 | ✓ Passed | — |
| 3rd Semester | 2.87 | ✓ Passed | — |
| 4th Semester | — | ⊗ 1 yet to pass | 25841 Accounting [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25841 | Accounting | Theory | 4th Sem | Pending |

---

### Roll 843010 — All Passed ✓

**Total yet to pass: 0**

| Semester | GPA | Status |
|---|---|---|
| 1st Semester | 3.44 | ✓ Passed |
| 2nd Semester | 3.49 | ✓ Passed |
| 3rd Semester | 3.57 | ✓ Passed |
| 4th Semester | 3.73 | ✓ Passed |

No referred subjects.

---

### Roll 843011 — ⊗ 2 Subjects Yet to Pass

**Total yet to pass: 2**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 2.94 | ✓ Passed | — |
| 2nd Semester | 2.86 | ✓ Passed | — |
| 3rd Semester | 2.88 | ✓ Passed | — |
| 4th Semester | — | ⊗ 2 yet to pass | 25841 Accounting [4th] · 26741 Electrical Installation Planning and Estimating [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation Planning and Estimating | Theory | 4th Sem | Pending |

---

### Roll 843012 — ⊗ 5 Subjects Yet to Pass

**Total yet to pass: 5**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 2.90 | ✓ Passed | — |
| 2nd Semester | — | Missing Result | — |
| 3rd Semester | — | ⊗ 2 yet to pass | 25913 Chemistry [3rd] · 26721 Electrical Circuits-I [2nd] |
| 4th Semester | — | ⊗ 5 yet to pass | 25841 Accounting [4th] · 25913 Chemistry [3rd] · 26721 Electrical Circuits-I [2nd] · 26741 Electrical Installation, Planning and Estimating [4th] · 26845 Digital Electronics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25913 | Chemistry | Theory | 3rd Sem | Pending |
| 26721 | Electrical Circuits-I | Theory | 2nd Sem | Pending |
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation, Planning and Estimating | Theory | 4th Sem | Pending |
| 26845 | Digital Electronics | Theory | 4th Sem | Pending |

---

### Roll 843014 — ⊗ 3 Subjects Yet to Pass

**Total yet to pass: 3**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 2.99 | ✓ Passed | — |
| 2nd Semester | — | Missing Result | — |
| 3rd Semester | — | ⊗ 2 yet to pass | 25913 Chemistry [3rd] · 25922 Physics-II [2nd] |
| 4th Semester | — | ⊗ 3 yet to pass | 25841 Accounting [4th] · 25913 Chemistry [3rd] · 25922 Physics-II [2nd] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25913 | Chemistry | Theory | 3rd Sem | Pending |
| 25922 | Physics-II | Theory | 2nd Sem | Pending |
| 25841 | Accounting | Theory | 4th Sem | Pending |

---

### Roll 843015 — ⊗ 3 Subjects Yet to Pass

**Total yet to pass: 3**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.13 | ✓ Passed | — |
| 2nd Semester | 2.72 | ✓ Passed | — |
| 3rd Semester | — | ⊗ 1 yet to pass | 25913 Chemistry [3rd] |
| 4th Semester | — | ⊗ 3 yet to pass | 25841 Accounting [4th] · 25913 Chemistry [3rd] · 26741 Electrical Installation Planning and Estimating [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25913 | Chemistry | Theory | 3rd Sem | Pending |
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation Planning and Estimating | Theory | 4th Sem | Pending |

---

### Roll 843016 — All Passed ✓

**Total yet to pass: 0**

| Semester | GPA | Status |
|---|---|---|
| 1st Semester | 3.76 | ✓ Passed |
| 2nd Semester | 3.45 | ✓ Passed |
| 3rd Semester | 3.38 | ✓ Passed |
| 4th Semester | 3.12 | ✓ Passed |

No referred subjects.

---

### Roll 843017 — ⊗ 2 Subjects Yet to Pass

**Total yet to pass: 2**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.37 | ✓ Passed | — |
| 2nd Semester | 2.89 | ✓ Passed | — |
| 3rd Semester | 3.10 | ✓ Passed | — |
| 4th Semester | — | ⊗ 2 yet to pass | 25841 Accounting [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 843018 — All Passed ✓

**Total yet to pass: 0**

| Semester | GPA | Status |
|---|---|---|
| 1st Semester | 3.65 | ✓ Passed |
| 2nd Semester | 3.36 | ✓ Passed |
| 3rd Semester | 3.54 | ✓ Passed |
| 4th Semester | 3.61 | ✓ Passed |

No referred subjects.

---

### Roll 843019 — ⊗ 3 Subjects Yet to Pass

**Total yet to pass: 3**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 2.92 | ✓ Passed | — |
| 2nd Semester | 2.56 | ✓ Passed | — |
| 3rd Semester | — | ⊗ 1 yet to pass | 25913 Chemistry [3rd] |
| 4th Semester | — | ⊗ 3 yet to pass | 25913 Chemistry [3rd] · 26742 DC Machine [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25913 | Chemistry | Theory | 3rd Sem | Pending |
| 26742 | DC Machine | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 843021 — ⊗ 8 Subjects Yet to Pass

**Total yet to pass: 8**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.11 | ✓ Passed | — |
| 2nd Semester | 3.06 | ✓ Passed | — |
| 3rd Semester | — | ⊗ 1 yet to pass | 25931 Mathematics-III [3rd] |
| 4th Semester | — | ⊗ 8 yet to pass | 25811 Social Science [4th] · 25841 Accounting [4th] · 25931 Mathematics-III [3rd] · 26741 Electrical Installation Planning and Estimating [4th] · 26742 DC Machine [4th] · 26743 Electrical Engineering Project-I [4th] · 26845 Digital Electronics [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25931 | Mathematics-III | Theory | 3rd Sem | Pending |
| 25811 | Social Science | Theory | 4th Sem | Pending |
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation Planning and Estimating | Theory & Practical | 4th Sem | Pending |
| 26742 | DC Machine | Theory & Practical | 4th Sem | Pending |
| 26743 | Electrical Engineering Project-I | Theory | 4th Sem | Pending |
| 26845 | Digital Electronics | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 843022 — ⊗ 7 Subjects Yet to Pass

**Total yet to pass: 7**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | — | Missing Result | — |
| 2nd Semester | 2.61 | ✓ Passed | — |
| 3rd Semester | — | ⊗ 2 yet to pass | 25911 Mathematics-I [1st] · 25931 Mathematics-III [3rd] |
| 4th Semester | — | ⊗ 7 yet to pass | 25811 Social Science [4th] · 25841 Accounting [4th] · 25911 Mathematics-I [1st] · 25931 Mathematics-III [3rd] · 26741 Electrical Installation Planning and Estimating [4th] · 26742 DC Machine [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25911 | Mathematics-I | Theory | 1st Sem | Pending |
| 25931 | Mathematics-III | Theory | 3rd Sem | Pending |
| 25811 | Social Science | Theory | 4th Sem | Pending |
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation Planning and Estimating | Theory | 4th Sem | Pending |
| 26742 | DC Machine | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 843024 — ⊗ 5 Subjects Yet to Pass

**Total yet to pass: 5**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.27 | ✓ Passed | — |
| 2nd Semester | — | Missing Result | — |
| 3rd Semester | — | ⊗ 1 yet to pass | 26721 Electrical Circuits-I [2nd] |
| 4th Semester | — | ⊗ 5 yet to pass | 25841 Accounting [4th] · 26721 Electrical Circuits-I [2nd] · 26741 Electrical Installation Planning and Estimating [4th] · 26742 DC Machine [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 26721 | Electrical Circuits-I | Theory | 2nd Sem | Pending |
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation Planning and Estimating | Theory | 4th Sem | Pending |
| 26742 | DC Machine | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 843025 — ⊗ 2 Subjects Yet to Pass

**Total yet to pass: 2**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.20 | ✓ Passed | — |
| 2nd Semester | 2.45 | ✓ Passed | — |
| 3rd Semester | 3.07 | ✓ Passed | — |
| 4th Semester | — | ⊗ 2 yet to pass | 25841 Accounting [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 843026 — ⊗ 3 Subjects Yet to Pass

**Total yet to pass: 3**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 2.98 | ✓ Passed | — |
| 2nd Semester | 2.63 | ✓ Passed | — |
| 3rd Semester | — | ⊗ 1 yet to pass | 26731 Electrical Circuits-II [3rd] |
| 4th Semester | — | ⊗ 3 yet to pass | 25841 Accounting [4th] · 26731 Electrical Circuits-II [3rd] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 26731 | Electrical Circuits-II | Theory | 3rd Sem | Pending |
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 843027 — ⊗ 7 Subjects Yet to Pass

**Total yet to pass: 7**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.07 | ✓ Passed | — |
| 2nd Semester | — | Missing Result | — |
| 3rd Semester | — | ⊗ 2 yet to pass | 26721 Electrical Circuits-I [2nd] · 26731 Electrical Circuits-II [3rd] |
| 4th Semester | — | ⊗ 7 yet to pass | 25841 Accounting [4th] · 26721 Electrical Circuits-I [2nd] · 26731 Electrical Circuits-II [3rd] · 26741 Electrical Installation Planning and Estimating [4th] · 26742 DC Machine [4th] · 26845 Digital Electronics [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 26721 | Electrical Circuits-I | Theory | 2nd Sem | Pending |
| 26731 | Electrical Circuits-II | Theory | 3rd Sem | Pending |
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation Planning and Estimating | Theory | 4th Sem | Pending |
| 26742 | DC Machine | Theory | 4th Sem | Pending |
| 26845 | Digital Electronics | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 843029 — All Passed ✓

**Total yet to pass: 0**

| Semester | GPA | Status |
|---|---|---|
| 1st Semester | 3.80 | ✓ Passed |
| 2nd Semester | 3.53 | ✓ Passed |
| 3rd Semester | 3.63 | ✓ Passed |
| 4th Semester | 3.56 | ✓ Passed |

No referred subjects.

---

### Roll 843030 — All Passed ✓

**Total yet to pass: 0**

| Semester | GPA | Status |
|---|---|---|
| 1st Semester | 3.51 | ✓ Passed |
| 2nd Semester | 3.14 | ✓ Passed |
| 3rd Semester | 3.27 | ✓ Passed |
| 4th Semester | 3.32 | ✓ Passed |

No referred subjects.

---

### Roll 843031 — ⊗ 6 Subjects Yet to Pass

**Total yet to pass: 6**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.15 | ✓ Passed | — |
| 2nd Semester | — | Missing Result | — |
| 3rd Semester | — | ⊗ 2 yet to pass | 25913 Chemistry [3rd] · 26721 Electrical Circuits-I [2nd] |
| 4th Semester | — | ⊗ 6 yet to pass | 25841 Accounting [4th] · 25913 Chemistry [3rd] · 26721 Electrical Circuits-I [2nd] · 26741 Electrical Installation, Planning and Estimating [4th] · 26742 DC Machine [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25913 | Chemistry | Theory | 3rd Sem | Pending |
| 26721 | Electrical Circuits-I | Theory | 2nd Sem | Pending |
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation, Planning and Estimating | Theory | 4th Sem | Pending |
| 26742 | DC Machine | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 843032 — All Passed ✓

**Total yet to pass: 0**

| Semester | GPA | Status |
|---|---|---|
| 1st Semester | 3.90 | ✓ Passed |
| 2nd Semester | 3.47 | ✓ Passed |
| 3rd Semester | 3.65 | ✓ Passed |
| 4th Semester | 3.63 | ✓ Passed |

No referred subjects.

---

### Roll 843036 — ⊗ 2 Subjects Yet to Pass

**Total yet to pass: 2**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.65 | ✓ Passed | — |
| 2nd Semester | 3.08 | ✓ Passed | — |
| 3rd Semester | 3.00 | ✓ Passed | — |
| 4th Semester | — | ⊗ 2 yet to pass | 26741 Electrical Installation, Planning and Estimating [4th] · 26742 DC Machine [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 26741 | Electrical Installation, Planning and Estimating | Theory | 4th Sem | Pending |
| 26742 | DC Machine | Theory | 4th Sem | Pending |

---

### Roll 747259 — ⊗ 7 Subjects Yet to Pass

**Total yet to pass: 7**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | — | ✓ Passed | — |
| 2nd Semester | — | ⊗ 1 yet to pass | 25922 Physics-II [2nd] |
| 3rd Semester | — | ⊗ 2 yet to pass | 25913 Chemistry [3rd] · 26833 Industrial Electronics [3rd] |
| 4th Semester | — | ⊗ 4 yet to pass | 25913 Chemistry [3rd] · 25922 Physics-II [2nd] · 26741 Electrical Installation, Planning and Estimating [4th] · 26742 DC Machine [4th] · 26833 Industrial Electronics [3rd] · 26845 Digital Electronics [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25922 | Physics-II | Theory | 2nd Sem | Pending |
| 25913 | Chemistry | Theory | 3rd Sem | Pending |
| 26833 | Industrial Electronics | Theory | 3rd Sem | Pending |
| 26741 | Electrical Installation, Planning and Estimating | Theory | 4th Sem | Pending |
| 26742 | DC Machine | Theory | 4th Sem | Pending |
| 26845 | Digital Electronics | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 747260 — ⊗ 2 Subjects Yet to Pass

**Total yet to pass: 2**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 2.75 | ✓ Passed | — |
| 2nd Semester | — | ⊗ 1 yet to pass | 25921 Mathematics-II [2nd] |
| 3rd Semester | 2.95 | ✓ Passed | — |
| 4th Semester | — | ⊗ 1 yet to pass | 25841 Accounting [4th] · 25921 Mathematics-II [2nd] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25921 | Mathematics-II | Theory | 2nd Sem | Pending |
| 25841 | Accounting | Theory | 4th Sem | Pending |

---

### Roll 747344 — ⊗ 3 Subjects Yet to Pass

**Total yet to pass: 3**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 2.69 | ✓ Passed | — |
| 2nd Semester | 2.68 | ✓ Passed | — |
| 3rd Semester | — | ⊗ 1 yet to pass | 26731 Electrical Circuits-II [3rd] · 26732 Electrical Appliances [3rd] |
| 4th Semester | — | ⊗ 2 yet to pass | 26731 Electrical Circuits-II [3rd] · 26741 Electrical Installation, Planning and Estimating [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 26731 | Electrical Circuits-II | Theory | 3rd Sem | Pending |
| 26732 | Electrical Appliances | Theory | 3rd Sem | Pending |
| 26741 | Electrical Installation, Planning and Estimating | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 886748 — All Passed ✓

**Total yet to pass: 0**

| Semester | GPA | Status |
|---|---|---|
| 1st Semester | 3.50 | ✓ Passed |
| 2nd Semester | 3.36 | ✓ Passed |
| 3rd Semester | 3.68 | ✓ Passed |
| 4th Semester | 3.64 | ✓ Passed |

No referred subjects.

---

### Roll 886749 — ⊗ 3 Subjects Yet to Pass

**Total yet to pass: 3**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 2.88 | ✓ Passed | — |
| 2nd Semester | — | Missing Result | — |
| 3rd Semester | 2.99 | ✓ Passed | — |
| 4th Semester | — | ⊗ 3 yet to pass | 26721 Electrical Circuits-I [4th] · 26845 Digital Electronics [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 26721 | Electrical Circuits-I | Theory | 4th Sem | Pending |
| 26845 | Digital Electronics | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |

---

### Roll 886750 — ⊗ 2 Subjects Yet to Pass

**Total yet to pass: 2**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | 3.13 | ✓ Passed | — |
| 2nd Semester | — | Missing Result | — |
| 3rd Semester | 3.37 | ✓ Passed | — |
| 4th Semester | — | ⊗ 2 yet to pass | 26722 Electrical Engineering Drawing [4th] · 26742 DC Machine [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 26722 | Electrical Engineering Drawing | Theory | 4th Sem | Pending |
| 26742 | DC Machine | Theory | 4th Sem | Pending |

---

### Roll 888360 — ⊗ 5 Subjects Yet to Pass

**Total yet to pass: 5**

| Semester | GPA | Status | Referred Subjects |
|---|---|---|---|
| 1st Semester | — | Missing Result | — |
| 2nd Semester | — | Missing Result | — |
| 3rd Semester | — | Missing Result | — |
| 4th Semester | — | ⊗ 5 yet to pass | 25841 Accounting [4th] · 26712 Electrical Engineering Materials [4th] · 26741 Electrical Installation, Planning and Estimating [4th] · 26845 Digital Electronics [4th] · 27044 Applied Mechanics [4th] |

| Code | Subject | Type | First Referred | Cleared |
|---|---|---|---|---|
| 25841 | Accounting | Theory | 4th Sem | Pending |
| 26712 | Electrical Engineering Materials | Theory | 4th Sem | Pending |
| 26741 | Electrical Installation, Planning and Estimating | Theory | 4th Sem | Pending |
| 26845 | Digital Electronics | Theory | 4th Sem | Pending |
| 27044 | Applied Mechanics | Theory | 4th Sem | Pending |
