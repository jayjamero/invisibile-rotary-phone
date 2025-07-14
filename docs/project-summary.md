# Project Summary

## Approach

At the beginning of this project, the process I followed was:

1. Create an issue outlining the changes I wanted to make + testing strategy
2. Implement the feature
3. Create pull request, that links back to the innitial issue.

The reason for doing this is I wanted to demonstrate, that I value having a paper trail into decisions and the work involved. I also want to define what done looks like, how the testing strategy looks and to help the reviewer have confidence in the PR.
As the project grew in complexity, and with time constraints, I decided after the first 5 features, to change tact. In real work environment I would prefer to have things in smaller chunks.

### Semver/Conventional commits

Since I prefer using a rebase strategy vs merge commit, the connventional commit strategy not only helps the reviewer step through commits easier, but it also helps deal with merge conflicts much easier. (Especially with `git.rerere` enabled).
I didn't squash any commits, so all of the my steps and thoughts are documented in the commit history.

## Use of AI

After the first 5 features/issues, I realised I needed to speed up the process in order to complete the project.

I used CoPilot + Sonnete v4 to help me create unit tests as well as functionality of access restriction and card display.

It helped alot as I tend to refactor as I move forward with requirements.

The conventional commits and building the project piece meal definetly when needing to use AI to complete some tedius tasks.

## Wireframes

Once I took a look at the requirements doc, I began to visually map out what was required in a form of a wireframe.

The final product delivered for the Information screen difers from the wireframe slightly as its not including a search bar or pagination at the top (its on the bottom), I decided as the project grew in complexity, to just focus on the MVP realease.

<img width="882" height="1071" alt="Screenshot 2025-07-15 at 5 24 17 am" src="https://github.com/user-attachments/assets/173bd58a-8be0-498d-baa0-73b59f9a2711" />

## Breakdown of work

Using the wireframes and the requirements doc, I then broke down the tasks of work into smaller pieces.

This process is fluid, I may combine 2 of the features into 1 PR, depending on if it makes sense in development.

For example adding Jest and RTL would require something to test against, so I combined the Footer UI with it. This atleast can give the reviewer some confidence on whats required to test and that the feature is working as expected.

Some things that I think about is what can be easier for the review to code review but also test. Having many files in a PR is just not a great developer experience.

<img width="469" height="1044" alt="Screenshot 2025-07-15 at 5 24 02 am" src="https://github.com/user-attachments/assets/c4391461-8a02-4745-a388-e5923b10c36b" />

🟢 Green boxes represent the work completed

