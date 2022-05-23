# ThiefNovel

This VSCode extension is inspired by [Thief-Book](https://marketplace.visualstudio.com/items?itemName=C-TEAM.thief-book), but with a better performance when loading large text files.

## Features

Read novels in visual studio code status bar.

## Getting Started

This extension is deactivated by default. Press `Ctrl+Alt+m` to activate before using any other commands.

## Extension Settings

This extension contributes the following settings:

* `thief-novel.enable`: enable/disable this extension
* `thief-novel.novelPath`: the path to the novel file
* `thief-novel.page`: current page number
* `thief-novel.charsPerPage`: number of characters per page

## Shortcuts

* `Ctrl+Alt+,`: Previous page
* `Ctrl+Alt+.`: Next page
* `Ctrl+Alt+;`: Jump to page
* `Ctrl+m`: Hide status bar novel
* `Ctrl+Alt+m`: Show status bar novel

## Release Notes

### 0.2.2

- Changed default number of characters per page to 80.
- Trying to fix [#1](https://github.com/KCFindstr/thief-novel-vsc/issues/1).

### 0.2.1

- Minor bug fixes.

### 0.2.0

- Add html unicode convert support (converts strings like `&#1234;` to the unicode character).

### 0.1.1

- Initial release.