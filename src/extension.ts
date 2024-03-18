// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { retrieveMainEditor, genRangeWithOffset } from './utils'
import { PanelProvider } from './gbEditor';
import { start, stop, sendRequest } from "./connection";
import { getSpecs } from './spec'
import { getSections } from './section'

// We use a top-level variable for recording the current editor.
// let editor: vscode.TextEditor | undefined;

export async function activate(context: vscode.ExtensionContext) {
	console.log('GuaBao VLang Mode is now active!');
	const panelProvider = new PanelProvider();

	// Provide inlay hints for the text editor.
	vscode.languages.registerInlayHintsProvider(
		{ scheme: 'file', language: 'guabao' },
		{
			provideInlayHints(document, range, token): vscode.InlayHint[] {
				// We store the editor in a state.
				if (context.workspaceState.get("editor") === retrieveMainEditor()) {
					const specs = getSpecs(context.workspaceState.get("response"));
					let inlayHints = specs.flatMap(s => [new vscode.InlayHint(s.range.start, ` ${s.pre} ⇒ ${s.post}`)])
					return inlayHints;
				} else {
					return [];
				}
			}
		}
	)

	// This is the code for 'Guabao start'.
	// The further below disposables register other commands.
	const startDisposable = vscode.commands.registerCommand('guabaovlang.start', () => {
		// Store the first editor in a variable.
		context.workspaceState.update("editor", retrieveMainEditor());
		// TODO: Check for the presence of the panel in a more clever way.
		// If none of the tabs has name "GB Webview" ...
		if(vscode.window.tabGroups.all.flatMap(group => group.tabs).filter(tab => tab.label === "GB Webview").length === 0) {
			// Initialize the panel.
			panelProvider.createPanel();
			// Handle message sent from webview such as decoration.
			panelProvider.receiveMessage(context);
			// For testing. The below line prints the text in the current editor.
			panelProvider.format(vscode.window.visibleTextEditors[0]?.document.getText() || "", context.extensionPath);
			// We prevent focusing on the panel instead of the text editor.
			vscode.commands.executeCommand('workbench.action.focusFirstEditorGroup');
		}
	});
	context.subscriptions.push(startDisposable);

	// TODO: Fix a bug that after opening and then closing a panel, reloading generates an error.
	const reloadDisposable = vscode.commands.registerCommand('guabaovlang.reload', async () => {
		if(panelProvider.initiated()) {
			// Store the main editor in a state.
			context.workspaceState.update("editor", retrieveMainEditor());
			// Get the path for the current text file.
			const path = (context.workspaceState.get("editor") as  vscode.TextEditor).document.uri.fsPath;
			// Send the request asynchronously.
			const response = await sendRequest("guabao", [path, { "tag": "ReqReload" }])
			// We use the shared state to cache the response.
			context.workspaceState.update("response", response);
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

		let range = genRangeWithOffset(retrieveMainEditor());

		await sendRequest("guabao", [
			range.path, { "tag": "ReqInspect",
				"contents": [
					[range.path, range.startLine, range.startChar, range.startOff],
					[range.path, range.endLine, range.endChar, range.endOff]
				]
			}
		]);
		
	});
	context.subscriptions.push(inspectDisposable);

	const refineDisposable = vscode.commands.registerCommand('guabaovlang.refine', async () => {
		// Check if the panel is present before doing anything else.
		if(panelProvider.initiated()) {
			
			let range = genRangeWithOffset(retrieveMainEditor());

			const response = await sendRequest("guabao", [
				range.path, { "tag": "ReqRefine2",
					"contents": [
						[
							[range.path, range.startLine, range.startChar, range.startOff],
							[range.path, range.endLine, range.endChar, range.endOff],
						],
						"GARBAGE" // TODO: This should not be GARBAGE. 
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

		let range = genRangeWithOffset(retrieveMainEditor());

		await sendRequest("guabao", [
			range.path, { "tag": "ReqHelloWorld",
				"contents": [
					[range.path, range.startLine, range.startChar, range.startOff],
					[range.path, range.endLine, range.endChar, range.endOff]
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

