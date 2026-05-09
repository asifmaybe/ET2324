# How to Publish Future Board Results

This guide explains how to use the built-in **Publish Board Results** tool inside the Admin Panel to publish results for upcoming semesters (e.g., 5th Semester, 6th Semester, etc.) directly from the app.

---

## Step 1: Open the Admin Panel
1. Open the Electrical 23-24 app and log in as **Golam Rabbani Asif**.
2. Tap the hamburger menu (three lines) in the top-right corner.
3. Tap the **Admin Panel** button at the bottom of the menu.
4. On the Admin Dashboard, look for the **Admin Tools** section and tap **Publish Board Results**.

---

## Step 2: Prepare the JSON Payload
To publish results, you need to provide the data in a specific JSON format. You can prepare this text file on a computer, email it to your phone, or use a code editor app.

Here is the exact structure you need to use:

```json
{
  "semester_number": 5,
  "published_at": "2026-10-25",
  "students": [
    {
      "roll_no": "842944",
      "gpa": 3.10,
      "is_missing": false,
      "new_referred_subjects": [
        {
          "code": "26751",
          "name": "Generation of Electrical Power",
          "type": "Theory"
        }
      ],
      "cleared_subject_codes": [
        "25913"
      ]
    },
    {
      "roll_no": "842954",
      "gpa": 3.92,
      "is_missing": false,
      "new_referred_subjects": [],
      "cleared_subject_codes": []
    }
  ]
}
```

### Explanation of the Fields:
- `semester_number`: The semester you are publishing (e.g., `5` for 5th Semester).
- `published_at`: The date the results were officially published (`YYYY-MM-DD`).
- `students`: An array containing the result details for every student.
  - `roll_no`: The student's board roll number.
  - `gpa`: The student's GPA for this specific semester (use `null` if the result is missing/withheld).
  - `is_missing`: Set to `true` if the result is withheld, otherwise `false`.
  - `new_referred_subjects`: A list of any **new** subjects the student failed in this specific semester. If they passed everything, leave it as an empty array `[]`.
    - `code`: The 5-digit subject code.
    - `name`: The subject name.
    - `type`: Usually `"Theory"` or `"Practical"`.
  - `cleared_subject_codes`: A list of the 5-digit subject codes for any **old** referred subjects (from 1st, 2nd, 3rd, or 4th semester) that the student successfully passed during this 5th-semester exam. The system will automatically mark these as "Cleared in 5th Semester".

---

## Step 3: Paste and Publish
1. Copy the entire JSON text you prepared.
2. In the app, on the **Publish Results** screen, paste the text into the large **JSON Payload** text box.
3. Tap the green **Publish Results** button at the bottom.
4. A confirmation popup will ask: *"Are you sure you want to publish the results for Semester 5?"*
5. Tap **Publish**.

---

## What Happens Automatically?
Once you hit publish, the app does all the heavy lifting in real-time:
1. It creates the 5th Semester record.
2. It uploads every student's 5th Semester GPA.
3. It registers any new failed subjects as "Pending".
4. It searches the database for the old subjects listed in `cleared_subject_codes` and magically updates them to "Cleared".
5. Every student's CGPA and Dashboard Progress Bar will instantly recalculate and update on their screens!

---

### Tips for Success
- Always validate your JSON file using a free online tool (like [jsonlint.com](https://jsonlint.com/)) before pasting it into the app to ensure you don't have any missing commas or brackets.
- If a student's result is missing or withheld by the board, format their block like this:
  ```json
  {
    "roll_no": "842999",
    "gpa": null,
    "is_missing": true,
    "new_referred_subjects": [],
    "cleared_subject_codes": []
  }
  ```
