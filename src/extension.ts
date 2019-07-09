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
		}
	});

	if (activeEditor) {
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
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
		activeEditor.setDecorations(decorationType, rangesToDecorate);
	}

	function check_ifIdWithoutNotNull(rangesToDecorate: vscode.DecorationOptions[]) {
		let regex = /if ?\(([^=)]*[iI][dD](?!\.)\b) ?[^=<>\r\n]*?\)/g;
		let hoverMessage = 'An ID of 0 would evaluate to false. Consider: ${match[1]} != null';
		let popupMessage = 'ID of 0 would evaluate to false. Consider adding "!= null" for if-statements containing IDs: ${errors.join(", ")}';
		genericCheck(regex, hoverMessage, popupMessage, rangesToDecorate);
	}

	function check_ifAssignInsteadOfEquals(rangesToDecorate: vscode.DecorationOptions[]) {
		let regex = /if ?\((\w+[^=!<>\r\n])*=([^=\r\n]*)\)/g;
		let hoverMessage = 'Should be ${match[1]} == ${match[2]} or ${match[1]} === ${match[2]}';
		let popupMessage = '= should be == or === in if-statements: ${errors.join(", ")}';
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
		while (match) {
			errors.push(match[1]);
			const startPos = activeEditor.document.positionAt(match.index);
			const endPos = activeEditor.document.positionAt(match.index + match[0].length);
			const decoration = {
				'range': new vscode.Range(startPos, endPos),
				'hoverMessage': hoverMessage.replace(/\$\{match\[1\]\}/g, match[1]).replace(/\$\{match\[2\]\}/g, match[2]) // e.g. `An ID of 0 would evaluate to false. Consider: ${match[1]} != null`
			};
			rangesToDecorate.push(decoration);
			match = regexIdVariable.exec(text);
		}
		if (errors.length > 0) {
			// e.g. let popupMessage = `ID of 0 would evaluate to false. Consider adding "!= null" for if-statements containing IDs: `;
			vscode.window.showInformationMessage(popupMessage.replace(/\$\{errors.join\(", "\)}/g, errors.join(', '))); // e.g. popupMessage + errors.join(', '));
		}
	}
}
