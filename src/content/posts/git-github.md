---
author: Ulises Gómez
publishDate: 2024-12-20T15:20:35Z
title: Git & GitHub Basics
tags:
    - Git
    - GitHub
    - Version Control
    - Collaboration
description:
  A complete basic guide on how to use Git and GitHub for version control and collaboration.
cover:
  src: './images/customizing-theme-color-schemes/cover.webp'
  alt: 'Customizing color schemes'
---

## Introduction

Git and GitHub are essential tools for any programmer. Git is a version control system that allows you to track changes to your code, while GitHub is a platform for hosting and collaborating on Git repositories. This guide will walk you through the basics of using Git and GitHub.

## Installing Git

First, you need to install Git on your computer. You can download the appropriate version for your operating system from the [official Git website](https://git-scm.com/downloads). Follow the installation instructions for your system.

## Basic Git Commands

Here are some basic Git commands you'll use frequently:

* `git init`: Initializes a new Git repository in the current directory.
* `git clone <repository_url>`: Creates a local copy of a remote repository.
* `git add .`: Stages all changes in the current directory.
* `git commit -m "Your commit message"`: Commits the staged changes with a descriptive message.
* `git status`: Shows the status of your working directory.
* `git push origin <branch_name>`: Uploads your local commits to the remote repository.
* `git pull origin <branch_name>`: Downloads changes from the remote repository to your local machine.

## Creating a GitHub Repository

1.  Go to [GitHub](https://github.com/) and sign up for an account if you don't already have one.
2.  Click the "+" button in the top right corner and select "New repository".
3.  Give your repository a name and description.
4.  Choose whether to make the repository public or private.
5.  You can initialize the repository with a README file, if you wish.
6.  Click "Create repository".

## Connecting Git to GitHub

Once you have a GitHub repository, you can connect it to your local Git repository:

1.  In your local repository, run:
    ```bash
    git remote add origin <repository_url>
    ```
    Replace `<repository_url>` with the URL of your GitHub repository.
2.  To push your local commits to GitHub, use:
    ```bash
    git push -u origin main
    ```

## Collaboration with GitHub

GitHub provides features for collaboration, such as:

* **Issues:** For tracking bugs, feature requests, and tasks.
* **Pull Requests:** For proposing changes to a repository and reviewing code.
* **Branches:** For isolating development work without affecting the main codebase.

## Conclusion

Git and GitHub are powerful tools that can greatly improve your workflow and collaboration with others. This guide provides a basic introduction, but there's much more to explore. Refer to the [official Git documentation](https://git-scm.com/doc) and the [GitHub documentation](https://docs.github.com/) for more information.
