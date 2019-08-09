import * as vscode from 'vscode';

// called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
	let activeEditor = vscode.window.activeTextEditor;
	let timeout: NodeJS.Timer | undefined = undefined;
	const decorationType = vscode.window.createTextEditorDecorationType({
		borderWidth: '1px',
		borderStyle: 'solid',
		overviewRulerColor: 'blue',
		overviewRulerLane: vscode.OverviewRulerLane.Right,
		light: { // used in light color themes
			borderColor: 'darkblue'
		},
		dark: { // used in dark color themes
			borderColor: 'lightblue'
		},
		textDecoration: 'wavy underline'
	});

	if (activeEditor) {
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
			randomIeReminder();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	function triggerUpdateDecorations() {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		timeout = setTimeout(updateDecorations, 500);
	}

	function updateDecorations() {
		if (!activeEditor) {
			return;
		}
		let rangesToDecorate: vscode.DecorationOptions[] = [];
		check_ifIdWithoutNotNull(rangesToDecorate);
		check_ifAssignInsteadOfEquals(rangesToDecorate);
		check_httpGet(rangesToDecorate);
		check_scopeIdentitySQL(rangesToDecorate);
		check_rowCountSQL(rangesToDecorate);
		check_encryptedSQL(rangesToDecorate);
		check_consoleLog(rangesToDecorate);
		check_numberOfId(rangesToDecorate);
		check_todoComment(rangesToDecorate);
		activeEditor.setDecorations(decorationType, rangesToDecorate);
	}

	function check_ifIdWithoutNotNull(rangesToDecorate: vscode.DecorationOptions[]) {
		let regex = /if ?\(([^=)]*?I[dD](?!\.)\b) ?[^=<>\r\n]*?\)/g;
		let hoverMessage = 'An ID of 0 would evaluate to falsy. !(0) is truthy. Consider: ${match[1]} != null';
		let popupMessage = 'ID of 0 would evaluate to falsy. Consider adding "!= null" for if-statements containing IDs: ${errors.join(", ")}';
		genericCheck(regex, hoverMessage, popupMessage, rangesToDecorate);
	}

	function check_ifAssignInsteadOfEquals(rangesToDecorate: vscode.DecorationOptions[]) {
		let regex = /if ?\((\w+[^=!<>\r\n])*=([^=\r\n]*)\)/g;
		let hoverMessage = 'Should be ${match[1]} == ${match[2]} or ${match[1]} === ${match[2]}';
		let popupMessage = '= should be == or === in if-statements: ${errors.join(", ")}';
		genericCheck(regex, hoverMessage, popupMessage, rangesToDecorate);
	}

	function check_httpGet(rangesToDecorate: vscode.DecorationOptions[]) {
		let regex = /\$http\.get\(/g;
		let hoverMessage = 'For IE, use $http.post instead of $http.get, even for GET, and include an empty request object';
		let popupMessage = 'Use $http.post instead of $http.get (for IE)';
		genericCheck(regex, hoverMessage, popupMessage, rangesToDecorate);
	}

	function check_scopeIdentitySQL(rangesToDecorate: vscode.DecorationOptions[]) {
		let regex = /SCOPE_IDENTITY\(\)/g;
		let hoverMessage = "SCOPE_IDENTITY() is not thread-safe in SQL. Try using the output of an INSERT, e.g.: INSERT INTO MyTable (letters, numbers) OUTPUT INSERTED.[ID] VALUES ('ABC', 123)";
		let popupMessage = 'SCOPE_IDENTITY() is not thread-safe in SQL. Try using OUTPUT INSERTED.[ID] inside an INSERT.';
		genericCheck(regex, hoverMessage, popupMessage, rangesToDecorate);
	}

	function check_rowCountSQL(rangesToDecorate: vscode.DecorationOptions[]) {
		let regex = /@@ROWCOUNT/g;
		let hoverMessage = '@@ROWCOUNT is not very thread-safe in SQL. Try this: NOT EXISTS(SELECT 1 FROM ...)';
		let popupMessage = 'Instead of @@ROWCOUNT, try NOT EXISTS(SELECT 1 FROM ...)';
		genericCheck(regex, hoverMessage, popupMessage, rangesToDecorate);
	}

	function check_encryptedSQL(rangesToDecorate: vscode.DecorationOptions[]) {
		// cover "AS BEGIN"
		// cover "AS--WITH ENCRYPTION BEGIN" but missing "--comment: sp_password" after it
		let regex = /(AS(?!--WITH ENCRYPTION)[\r\n\s\t]+BEGIN[\r\n\s\t]*|AS *\t?--WITH ENCRYPTION[\r\n\s\t]+BEGIN[\r\n\s\t]*(?! *?\t?-- *?comment: sp_password).+)/g;
		let hoverMessage = 'AS BEGIN should have "AS--WITH ENCRYPTION" and "BEGIN  -- comment: sp_password"';
		let popupMessage = 'AS BEGIN should have "AS--WITH ENCRYPTION" and "BEGIN  -- comment: sp_password"';
		genericCheck(regex, hoverMessage, popupMessage, rangesToDecorate);
	}

	function check_consoleLog(rangesToDecorate: vscode.DecorationOptions[]) {
		let regex = /console\.log/g;
		let hoverMessage = 'Remember to remove console log outputs.';
		let popupMessage = 'A wild console.log() was found!';
		genericCheck(regex, hoverMessage, popupMessage, rangesToDecorate);
	}

	function check_numberOfId(rangesToDecorate: vscode.DecorationOptions[]) {
		let regex = /\WNumber\(([^|)]*?I(d|D))\)/g;
		let hoverMessage = 'If ${match[1]} is an ID but is empty, then Number(${match[1]}) would evaluate to 0 (e.g. Number("") -> 0).';
		let popupMessage = 'Number(someId) evaluates to 0 if someId is empty (e.g. "").';
		genericCheck(regex, hoverMessage, popupMessage, rangesToDecorate);
	}

	function check_todoComment(rangesToDecorate: vscode.DecorationOptions[]) {
		let regex = /(\/\/|--) ?TODO/g;
		let hoverMessage = 'To-do comment detected.';
		let popupMessage = 'To-do comment detected.';
		genericCheck(regex, hoverMessage, popupMessage, rangesToDecorate);
	}

	function genericCheck(regex: RegExp = /^$/, hoverMessage: string = '', popupMessage: string = '', rangesToDecorate: vscode.DecorationOptions[] = []) {
		if (!activeEditor) {
			return;
		}
		const text = activeEditor.document.getText();
		const regexIdVariable = regex; // e.g. /if ?\(([^=)]*[iI][dD](?!\.)\b) ?[^=<>\r\n]*?\)/g;
		let match = regexIdVariable.exec(text);
		let errors = [];
		let firstLineNumber = null;
		while (match) {
			errors.push(match[1]);
			if (firstLineNumber == null) {
				firstLineNumber = activeEditor.document.positionAt(match.index).line + 1;
			}
			const startPos = activeEditor.document.positionAt(match.index);
			const endPos = activeEditor.document.positionAt(match.index + match[0].length);
			const decoration = {
				'range': new vscode.Range(startPos, endPos),
				'hoverMessage': hoverMessage.replace(/\$\{match\[1\]\}/g, match[1]).replace(/\$\{match\[2\]\}/g, match[2]) // e.g. `An ID of 0 would evaluate to falsy. Consider: ${match[1]} != null`
			};
			rangesToDecorate.push(decoration);
			match = regexIdVariable.exec(text);
		}
		if (errors.length > 0) {
			// e.g. let popupMessage = `ID of 0 would evaluate to falsy. Consider adding "!= null" for if-statements containing IDs: `;
			vscode.window.showInformationMessage('Line ' + firstLineNumber + ': ' + popupMessage.replace(/\$\{errors.join\(", "\)}/g, errors.join(', '))); // e.g. popupMessage + errors.join(', '));
		}
	}

	function randomIeReminder() {
		let min = 1;
		let max = 140;
		let randomNumber = min + Math.floor(Math.random() * max);
		let message = ''

		if (randomNumber === 1) {
			message = 'Random reminder: Did you test in IE?';
		} else if (randomNumber === 2) {
			message = 'Random reminder from Yoda: Test in IE did you?';
		} else if (randomNumber === 3) {
			message = "Random reminder from Batman: Test in IE. Your users deserve it.";
		} else if (randomNumber === 4) {
			message = 'Random reminder from Gandalf: Test in IE. Or it shall not pass.';
		} else if (randomNumber === 5) {
			message = "Random reminder from Elsa: Did you test in IE? Don't let it go.";
		} else if (randomNumber === 6) {
			message = "Random reminder from Ash: Always test in IE. Catch all 'em bugs.";
		} else if (randomNumber === 7) {
			message = "Random reminder from Groot: Test in IE. I am Groot.";
		}

		if (message) {
			vscode.window.showInformationMessage(message);
		}
	}
}
