// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { PanelProvider } from './gbEditor';
import { start, stop, sendRequest } from "./connection";

let response: unknown;

let editor: vscode.TextEditor | undefined;

class Spec {
	constructor(public pre: string, public post: string, public range: vscode.Range) { }
}

function getSpecs(response: any): Spec[] {
	let specs = response.contents[1].filter((m: any) => m.tag === "ResUpdateSpecs")[0].contents
	let processed = specs.map((spec: any) => {
		const pre = spec[1];
		const post = spec[2];
		const originalRange = spec[3];
		const range = new vscode.Range(new vscode.Position(originalRange[0][1] - 1, originalRange[0][2] - 1),
									   new vscode.Position(originalRange[1][1] - 1, 0));
		return new Spec(pre, post, range);
	})
	return processed;
}

export async function activate(context: vscode.ExtensionContext) {
	console.log('GuaBao VLang Mode is now active!');
	const panelProvider = new PanelProvider();

	const startDisposable = vscode.commands.registerCommand('guabaovlang.start', () => {
		editor = vscode.window.activeTextEditor;
		if(vscode.window.tabGroups.all.flatMap(group => group.tabs).filter(tab => tab.label === "GB Webview").length === 0) {
			panelProvider.createPanel();
			panelProvider.format(vscode.window.activeTextEditor?.document.getText() || "");
		}
	});
	context.subscriptions.push(startDisposable);

	const reloadDisposable = vscode.commands.registerCommand('guabaovlang.reload', async () => {
		editor = vscode.window.activeTextEditor;
		const path = vscode.window.activeTextEditor?.document.uri.fsPath;
		response = await sendRequest("guabao", [path, { "tag": "ReqReload" }]);
		panelProvider.format(JSON.stringify(response));
	});
	context.subscriptions.push(reloadDisposable);

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

	const inspectDisposable = vscode.commands.registerCommand('guabaovlang.inspect', async () => {

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

		panelProvider.format(JSON.stringify(response));
		
	});
	context.subscriptions.push(refineDisposable);

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

	// TODO Create a SERVER MODULE path and pass to connection.start() as arg
	let server_module = context.asAbsolutePath("");
	start(server_module);
}

export function deactivate() {
	console.log('Deactivating GuaBao VLang Mode');
	// TODO Send termination signal to backend LSP server
	// "Connection.stop()"

	/* [OLD] Connection.stop()
	 * return Client__LSP$LanguageServerMule.destroy()
	 */
	stop()
	console.log('Bye!');
}

