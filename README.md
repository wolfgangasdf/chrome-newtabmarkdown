# chrome-newtabmarkdown

Chrome extension that overrides Chrome's new tab page with a markdown notebook, based on the beautiful https://github.com/maxbeier/chrome-blank-tab but it renders markdown using [marked](https://github.com/markedjs/marked) (loaded only when needed). Why? Easy hyperlinks. It's still fast, simple, customizable.

- <kbd>Escape</kbd> - toggle between editor (html below it) and html only, the document is saved if the editor is closed. 
- You can also triple-click on the page to open the editor and jump close to that point.
- <kbd>Command</kbd> or <kbd>Ctrl</kbd> + <kbd>s</kbd> - download a backup.
- You might need to click the page to make the hotkeys work.
- It synchronizes if open in multiple tabs.

Homepage: https://github.com/wolfgangasdf/chrome-newtabmarkdown


# Screenshot

![Screenshot](https://raw.githubusercontent.com/wolfgangasdf/chrome-newtabmarkdown/master/screenshot.png)


## Installation

Download or clone this repo, navigate to *[`chrome://extensions/`](chrome://extensions/)* , enable developer mode, click on `Load unpacked`, and select the downloaded folder (unzip before if you have downloaded a zip). Don't remove that folder!


## Used libraries
* https://github.com/markedjs/marked

