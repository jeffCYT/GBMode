// This module handles connections:

import * as vscode from "vscode";
import { LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind } from "vscode-languageclient/node";

let client: LanguageClient;


// var status = Disconnected | Connecting | Connected;

export function stop() {
	client.stop()
}

export async function sendRequest<R>(method: string, param: any): Promise<R> {
	return client.sendRequest(method, param);
}

function onNotification() {

}

function onError() {

}

export function start(serverModule:string) {
	const serverOptions: ServerOptions = {
		run: { command: "gcl", transport: TransportKind.stdio },
		debug: { command: "gcl", transport: TransportKind.stdio }
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for 'guabao' documents
		documentSelector: [{ scheme: 'file', language: 'guabao' }],
		synchronize: {
			// Notify the server about file changes to '.gcl' files contained in the workspace
			fileEvents: vscode.workspace.createFileSystemWatcher('**/.gcl')
		}
	};

	client = new LanguageClient ("GBM", "GuaBao LSP Server", serverOptions, clientOptions);
	client.start();
}