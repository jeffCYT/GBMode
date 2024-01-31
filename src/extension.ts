// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { GBEditorProvider } from './gbEditor';
import { start } from "./connection";

export function activate(context: vscode.ExtensionContext) {
	console.log('GuaBao VLang Mode is now active!');

	// Initiate CustomEditor
	context.subscriptions.push(GBEditorProvider.register(context));
	// TODO Initiate LSP connection

	// TODO Register all needed commands
	let disposable = vscode.commands.registerCommand('guabaovlang.greet', () => {
		vscode.window.showInformationMessage('Simple greetings from GuaBaoVLang!');
	});
	context.subscriptions.push(disposable);

	//JEFF_NOTE manual porting for the time being
	var editor = vscode.window.activeTextEditor;
	// var filePath = editor!.document.fileName;
	//var extensionPath = context.extensionPath;

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

