/* This module handles connections between the following components:
  + LSP Server
  + WebViewPanel
  + Extension main
 */

import * as vscode from "vscode";
import * as path from 'path';
import { LanguageClient,
    LanguageClientOptions,
	ServerOptions,
	TransportKind } from "vscode-languageclient/node";
import { activate } from "./extension";

let client: LanguageClient;


// var status = Disconnected | Connecting | Connected;

function stop() {
    // return destroy();
}


function sendRequest() {
    /** case status
     * Disconnected => start(); sendRequest()
     * Connecting => push(request) into queue?
     * Connected => LSPClient.onReady(); LSPClient.sendRequest(request)
     */
}

function onNotification() {

}

function onError() {

}

export function start(serverModule:string) {
    /** case status
     * Connected => OK() from LSP
     * Connecting => keep promise()
     * Disconnected => LSPClient.make();
     */
    	// The server is implemented in node
/* 	const serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);
 */
	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
		}
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'plaintext' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
		}
	};
    client = new LanguageClient ("GBM", "GuaBao LSP Server", serverOptions, clientOptions);

}