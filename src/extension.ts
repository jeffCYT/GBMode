// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { PanelProvider } from './gbEditor';
import { start } from "./connection";

export function activate(context: vscode.ExtensionContext) {
	console.log('GuaBao VLang Mode is now active!');
	const panelProvider = new PanelProvider();
	
	const startDisposable = vscode.commands.registerCommand('guabaovlang.start', () => {
		if(vscode.window.tabGroups.all.flatMap(group => group.tabs).filter(tab => tab.label === "GB Webview").length === 0) {
			panelProvider.createPanel();
			panelProvider.format(vscode.window.activeTextEditor?.document.getText() || "");
		}
	});
	context.subscriptions.push(startDisposable);

	const refineDisposable = vscode.commands.registerCommand('guabaovlang.refine', () => {
		if(vscode.window.tabGroups.all.flatMap(group => group.tabs).filter(tab => tab.label === "GB Webview").length !== 0) {
			panelProvider.format(vscode.window.activeTextEditor?.document.getText() || "");
		} else {
			vscode.window.showInformationMessage('Guabao not yet started!');
		}
	});
	context.subscriptions.push(refineDisposable);

	// TODO Create a SERVER MODULE path and pass to connection.start() as arg
	let server_module ="";
	start(server_module);

}

export function deactivate() {
	console.log('Deactivating GuaBao VLang Mode');
	// TODO Send termination signal to backend LSP server
	// "Connection.stop()"

	/* [OLD] Connection.stop()
	 * return Client__LSP$LanguageServerMule.destroy()
	 */

	console.log('Bye!');
}

