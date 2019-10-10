# Custom VSCode Linter

[![HitCount](http://hits.dwyl.com/hchiam/custom-vscode-linter.svg)](http://hits.dwyl.com/hchiam/custom-vscode-linter)

Some bugs are hard to notice during code reviews, or can be easily forgotten despite attempts at sharing knowledge across the team. Some of those bugs are also easy for a code linter to flag.

This linter flags common bugs I've encountered, so you can fix them _before_ code review, and without having to remember to check for them.

Install it on VS Code: https://marketplace.visualstudio.com/items?itemName=hchiam.custom-vscode-linter

## Examples of things it catches:

- `if (request.clientID)` -> should be `if (request.clientID != null)`
- `if (a = 1)` -> should be `if (a == 1)`
- `$http.get` -> should be `$http.post` for a GET to work in IE (the request object can be an empty JSON).
- `SCOPE_IDENTITY()`
- `@@ROWCOUNT`
- `console.log`
- `AS BEGIN` -> should be:
    ```sql
    AS--WITH ENCRYPTION
    BEGIN
      -- comment: sp_password
    ```
- `Number(someID)` would evaluate to 0 if someID is empty (e.g. Number('') -> 0).

## Future work / Suggestions:

https://github.com/hchiam/custom-vscode-linter/issues

## If you want to understand how it works under the hood:

I suggest you start reading at `function updateDecorations()` in [src/extension.ts](https://github.com/hchiam/custom-vscode-linter/blob/master/src/extension.ts)

## If you want to experiment with the source code:

- (do the usual steps to download from GitHub and navigate to folder)
- `npm install` (just once inside the folder)
- `npm run watch` (every time you want to test it)
- open folder in VS Code and hit F5 or go to Debug and click on the green triangle play button
- in user settings, you can customize the decoration color.

```
"workbench.colorCustomizations": {
    "myextension.decorationType": "#ff00ff"
}
```

The key file to edit is `extension.ts` (in the `src` folder).

## If you want to try it yourself from scratch:

```
npm install -g yo generator-code
npm install -g vsce
```

```
yo code

     _-----_     ╭──────────────────────────╮
    |       |    │   Welcome to the Visual  │
    |--(o)--|    │   Studio Code Extension  │
   `---------´   │        generator!        │
    ( _´U`_ )    ╰──────────────────────────╯
    /___A___\   /
     |  ~  |
   __'.___.'__
 ´   `  |° ´ Y `

? What type of extension do you want to create? New Extension (TypeScript)
? What's the name of your extension? custom-vscode-linter
? What's the identifier of your extension? custom-vscode-linter
? What's the description of your extension? Custom VSCode Linter!
? Enable JavaScript type checking in 'jsconfig.json'? No
? Initialize a git repository? No
? Which package manager to use? npm
```

edit extension.ts
edit README.md
edit package.json (add publisher and repository)

```
vsce package

```

(in VS Code:)
Ctrl+Shift+P
VSIX

(get token as per steps in references)

edit package.json (update version)
edit package-lock.json (update version)

```
vsce publish -p <token>
vsce publish

```

## Aside:

If you keep trying to use the VSIX in VS Code and it doesn't update, check if the extension is disabled.

# References I Used:

https://github.com/microsoft/vscode-extension-samples/tree/master/decorator-sample

https://itnext.io/creating-and-publishing-vs-code-extensions-912b5b8b529

https://code.visualstudio.com/api/working-with-extensions/publishing-extension

https://regex101.com
