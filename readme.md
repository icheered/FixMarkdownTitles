Fix Markdown Titles
===================

This extension makes sure the number of '=' or '-' underneath a title matches the lenght of the title.

Example
-------

Before:

```md
My Title
==

My Subtitle
-------------------
```

After:

```md
My Title
========

My Subtitle
-----------
```

Installation
------------

1. Clone this repository
2. Then in VSCode press `ctrl+shift+p` to open command window, select `Developer: Install extension from location`
3. En VSCode press `ctrl+shift+p` to open command window, select `Markdown: Toggle auto-format titles on save`

Development
-----------

After cloning the repository, make any changes you like. Then:

1. Run `npm install`
2. Run `npm run compile`
3. Then in VSCode press `ctrl+shift+p` to open command window, select `Developer: Install extension from location`
4. Select this folder
