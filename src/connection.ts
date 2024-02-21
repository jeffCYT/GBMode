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

export function stop() {
    client.stop()
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
	const serverOptions: ServerOptions = {
		run: { command: "gcl", transport: { kind: TransportKind.socket, port: 3000 } },
		debug: { command: "gcl", transport: { kind: TransportKind.socket, port: 3000 } }
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'plaintext' }],
		synchronize: {
			// Notify the server about file changes to '.gcl' files contained in the workspace
			fileEvents: vscode.workspace.createFileSystemWatcher('**/.gcl')
		}
	};
    client = new LanguageClient ("GBM", "GuaBao LSP Server", serverOptions, clientOptions);
	client.start();
}