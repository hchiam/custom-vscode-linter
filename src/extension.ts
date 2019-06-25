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
		// TODO: regexIfStatement -> for each, get ID variables separated by && and ||
		const regexIdVariable = /if ?\(([^=)]*[iI][dD](?!(==)))\)/g;
		const text = activeEditor.document.getText();
		const rangesToDecorate: vscode.DecorationOptions[] = [];
		let match = regexIdVariable.exec(text);
		let errors = [];
		while (match) {
			errors.push(match[1]);
			const startPos = activeEditor.document.positionAt(match.index);
			const endPos = activeEditor.document.positionAt(match.index + match[0].length);
			const decoration = {
				range: new vscode.Range(startPos, endPos),
				hoverMessage: `An ID of 0 would evaluate to false. Consider: if (${match[1]} != null)`
			};
			rangesToDecorate.push(decoration);
			match = regexIdVariable.exec(text);
		}
		activeEditor.setDecorations(decorationType, rangesToDecorate);
		if (errors.length > 0) {
			let startOfMessage = `An ID of 0 would evaluate to false. Consider adding "!= null" for these if statements: `;
			vscode.window.showInformationMessage(startOfMessage + errors.join(', '));
		}
	}
}
