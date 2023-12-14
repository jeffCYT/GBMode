// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { GBEditorProvider } from './gbEditor';

export function activate(context: vscode.ExtensionContext) {
	console.log('GuaBao VLang Mode is now active!');
	let disposable = vscode.commands.registerCommand('guabaovlang.greet', () => {
		vscode.window.showInformationMessage('Simple greetings from GuaBaoVLang!');
	});
	context.subscriptions.push(disposable);
	context.subscriptions.push(GBEditorProvider.register(context));

}

export function deactivate() {
	console.log('Deactivating GuaBao VLang Mode');
	// TODO Send termination signal to backend LSP server
	console.log('Bye!');
}
