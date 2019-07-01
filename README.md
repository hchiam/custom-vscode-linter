# Custom VSCode Linter

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

This repo took inspiration from https://github.com/microsoft/vscode-extension-samples/tree/master/decorator-sample
