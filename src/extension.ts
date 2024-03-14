// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { PanelProvider } from './gbEditor';
import { start, stop, sendRequest } from "./connection";
import { getSpecs } from './spec'
import { getSections } from './section'

let response: unknown;

let editor: vscode.TextEditor | undefined;

export async function activate(context: vscode.ExtensionContext) {
	console.log('GuaBao VLang Mode is now active!');
	const panelProvider = new PanelProvider();

	// Provide inlay hints for the text editor.
	vscode.languages.registerInlayHintsProvider(
		{ scheme: 'file', language: 'guabao' },
		{
			provideInlayHints(document, range, token): vscode.InlayHint[] {
				if (editor === vscode.window.activeTextEditor) {
					const specs = getSpecs(response);
					let inlayHints = specs.flatMap(s => [new vscode.InlayHint(s.range.start, s.pre), new vscode.InlayHint(s.range.end, s.post)])
					return inlayHints;
				} else {
					return [];
				}
			}
		}
	)

	// This is the code for 'Guabao start'.
	// The below disposables register other commands.
	const startDisposable = vscode.commands.registerCommand('guabaovlang.start', () => {
		// Store the current editor in a variable.
		editor = vscode.window.activeTextEditor;
		// If none of the tabs has name "GB Webview" ...
		if(vscode.window.tabGroups.all.flatMap(group => group.tabs).filter(tab => tab.label === "GB Webview").length === 0) {
			// Initialize the panel.
			panelProvider.createPanel();
			// For testing. The below line prints the text in the current editor.
			panelProvider.format(vscode.window.activeTextEditor?.document.getText() || "", context.extensionPath);
			// We prevent focusing on the panel instead of the text editor.
			vscode.commands.executeCommand('workbench.action.focusFirstEditorGroup');
		}
	});
	context.subscriptions.push(startDisposable);

	const reloadDisposable = vscode.commands.registerCommand('guabaovlang.reload', async () => {
		if(panelProvider.initiated()) {
			// Store the current editor in a variable.
			editor = vscode.window.activeTextEditor;
			// Get the path for the current text file.
			const path = vscode.window.activeTextEditor?.document.uri.fsPath;
			// Send the request asynchronously.
			response = await sendRequest("guabao", [path, { "tag": "ReqReload" }]);
			// Parse the response using functions in section.ts.
			const parsedResponse = getSections(response);
			// Tell the panel provider to turn the parsed response into HTML.
			panelProvider.format(parsedResponse, context.extensionPath);
			// Again, we prevent focusing on the panel instead of the text editor.
			vscode.commands.executeCommand('workbench.action.focusFirstEditorGroup');
		} else {
			// If the panel is not present, tell the user to run 'Guabao start' first.
			vscode.window.showInformationMessage("Please run 'Guabao start' first!");
		}
	});
	context.subscriptions.push(reloadDisposable);

	const inspectDisposable = vscode.commands.registerCommand('guabaovlang.inspect', async () => {

		// TODO: refactor the boilerplate out of the functions.
		// Currently there is a bug that prevents me from doing this.

		const editor = vscode.window.activeTextEditor
		const path = editor?.document.uri.fsPath;
		const selection = editor?.selection;
		// Note that the position is prone to off-by-one error.
		const startLine = (selection?.start.line ?? 0) + 1;
		const startChar = (selection?.start.character ?? 0) + 1;
		// Not sure if the default value Position(0, 0) is a good idea,
		// but at least I haven't encountered any problems. 
		const startOff = editor?.document.offsetAt(selection?.start || new vscode.Position(0, 0));
		const endLine = (selection?.end.line ?? 0) + 1;
		const endChar = (selection?.end.character ?? 0) + 1;
		const endOff = editor?.document.offsetAt(selection?.end || new vscode.Position(0, 0));

		await sendRequest("guabao", [
			path, { "tag": "ReqInspect",
				"contents": [
					[path, startLine, startChar, startOff],
					[path, endLine, endChar, endOff]
				]
			}
		]);
		
	});
	context.subscriptions.push(inspectDisposable);

	const refineDisposable = vscode.commands.registerCommand('guabaovlang.refine', async () => {
		// Check if the panel is present before doing anything else.
		if(panelProvider.initiated()) {
			// Same as above.
			const editor = vscode.window.activeTextEditor
			const path = editor?.document.uri.fsPath;
			const selection = editor?.selection;
			const startLine = (selection?.start.line ?? 0) + 1;
			const startChar = (selection?.start.character ?? 0) + 1;
			const startOff = editor?.document.offsetAt(selection?.start || new vscode.Position(0, 0));
			const endLine = (selection?.end.line ?? 0) + 1;
			const endChar = (selection?.end.character ?? 0) + 1;
			const endOff = editor?.document.offsetAt(selection?.end || new vscode.Position(0, 0));

			const response = await sendRequest("guabao", [
				path, { "tag": "ReqRefine2",
					"contents": [
						[
							[path, startLine, startChar, startOff],
							[path, endLine, endChar, endOff],
						],
						"GARBAGE"
					]
				}
			]);

			const parsedResponse = getSections(response);
			panelProvider.format(parsedResponse, context.extensionPath);

		} else {
			vscode.window.showInformationMessage("Please run 'Guabao start' first!");
		}
		
	});
	context.subscriptions.push(refineDisposable);

	// This is only for testing purpose.
	const helloWorldDisposable = vscode.commands.registerCommand('guabaovlang.helloworld', async () => {

		const editor = vscode.window.activeTextEditor
		const path = editor?.document.uri.fsPath;
		const selection = editor?.selection;
		const startLine = (selection?.start.line ?? 0) + 1;
		const startChar = (selection?.start.character ?? 0) + 1;
		const startOff = editor?.document.offsetAt(selection?.start || new vscode.Position(0, 0));
		const endLine = (selection?.end.line ?? 0) + 1;
		const endChar = (selection?.end.character ?? 0) + 1;
		const endOff = editor?.document.offsetAt(selection?.end || new vscode.Position(0, 0));

		await sendRequest("guabao", [
			path, { "tag": "ReqHelloWorld",
				"contents": [
					[path, startLine, startChar, startOff],
					[path, endLine, endChar, endOff]
				]
			}
		]);

	});
	context.subscriptions.push(helloWorldDisposable);

	// In the beginning, we planned to create a server module path and pass to connection.start() as arg.
	// However, now I run the gcl backend directly instead of using it as a Node.js module.
	let server_module = context.asAbsolutePath("");
	start(server_module);
}

export function deactivate() {
	console.log('Deactivating GuaBao VLang Mode');
	stop()
	console.log('Bye!');
}

