// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { PanelProvider } from './gbEditor';
import { start, stop, sendRequest } from "./connection";

export async function activate(context: vscode.ExtensionContext) {
	console.log('GuaBao VLang Mode is now active!');
	const panelProvider = new PanelProvider();

	const startDisposable = vscode.commands.registerCommand('guabaovlang.start', () => {
		if(vscode.window.tabGroups.all.flatMap(group => group.tabs).filter(tab => tab.label === "GB Webview").length === 0) {
			panelProvider.createPanel();
			panelProvider.format(vscode.window.activeTextEditor?.document.getText() || "");
		}
	});
	context.subscriptions.push(startDisposable);

	const reloadDisposable = vscode.commands.registerCommand('guabaovlang.reload', async () => {
		const path = vscode.window.activeTextEditor?.document.uri.fsPath;
		let response = await sendRequest("guabao", [path, { "tag": "ReqReload" }]);
	});
	context.subscriptions.push(reloadDisposable);

	const helloWorldDisposable = vscode.commands.registerCommand('guabaovlang.helloworld', async () => {
		const path = vscode.window.activeTextEditor?.document.uri.fsPath;
		let response = await sendRequest("guabao", [path, { "tag": "ReqHelloWorld", "contents": [[path, 0, 0, 0], [path, 0, 0, 0]] }]); // TODO: pass correct location tp backend
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

