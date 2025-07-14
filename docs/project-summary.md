# 📘 Project Summary

## ✅ Approach

At the outset of the project, I followed a structured process to ensure traceability, clarity, and high-quality deliverables:

1. **Created an issue** for each feature/task, including a testing strategy.
2. **Implemented the feature** based on the outlined scope.
3. **Opened a pull request (PR)** that referenced the original issue.

This workflow was chosen to:
- Establish a clear **paper trail** of decisions and changes.
- Define **"Definition of Done"** for each task.
- Make **testing strategies explicit**, improving confidence in the review process.

As the project grew in complexity and time became limited, I pivoted after delivering the first 5 features. In a real-world setting, I would prefer smaller, iterative chunks of work that are easier to manage and review.

---

### 🔁 Semantic Versioning & Conventional Commits

I adopted a **rebase strategy** over merge commits, supported by **conventional commit messages**. This approach offers several benefits:

- Helps reviewers follow the commit history clearly.
- Reduces merge conflicts (especially effective when using `git rerere`).
- Preserves the thought process and development steps in the commit log.

> ✨ I intentionally did not squash commits so each step and decision is visible in the history.

---

## 🤖 Use of AI

After completing the initial 5 features, I began leveraging AI tools to accelerate delivery without compromising quality:

- **GitHub Copilot** and **Sonnet v4** were used to:
  - Generate unit tests.
  - Implement logic for access control, hooks/providers and UI component development.

AI significantly improved productivity, especially as I often refactor while iterating on requirements.

The combination of **modular development** and **conventional commits** made it easier to apply AI effectively to repetitive or time-consuming tasks.

---

## 🧩 Wireframes

Upon reviewing the requirements document, I created **visual wireframes** to map out the layout and functionality.

While the final version of the Information screen differs slightly from the wireframe (e.g., pagination was moved to the bottom, search bar removed), the adjustments reflect a focus on delivering a robust **MVP** under time constraints.

> ![Wireframe Screenshot](https://github.com/user-attachments/assets/173bd58a-8be0-498d-baa0-73b59f9a2711)

---

## 🧱 Breakdown of Work

Using both the wireframes and the requirements document, I decomposed the project into smaller, manageable tasks.

This process remained **flexible** — in some cases, related features were grouped into a single PR when it made sense.  
For example:

- **Jest & RTL setup** was bundled with a basic **Footer UI component** to immediately test against something tangible.

My goal throughout was to:
- Improve **developer experience** for reviewers.
- Avoid overwhelming PRs with too many unrelated files.
- Ensure each PR is meaningful and testable.

> ![Task Breakdown Screenshot](https://github.com/user-attachments/assets/c4391461-8a02-4745-a388-e5923b10c36b)

🟢 **Green boxes** represent completed tasks.
