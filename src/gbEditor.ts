import * as vscode from 'vscode';

/* CustomTextEditorProvider for GuaBao */

export class GBEditorProvider implements vscode.CustomTextEditorProvider {
    private static readonly viewType = 'gbCustom.guabao';
    private htmlDummy = `<!DOCTYPE html><html lang="en"><head></head><body><h2> Testing GB</h2><p>RHS of GuaBao interactive Env</p></body></html>`;

    constructor(
		private readonly context: vscode.ExtensionContext
	) { }

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        console.log("GBEditorProvide.register()");
        const provider = new GBEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(GBEditorProvider.viewType, provider);
        return providerRegistration;
    }

    /* Core function when custom editor is opened */
    public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
        console.log("GBEditorProvide.resolveCustomTextEditor()");

        vscode.commands.executeCommand('workbench.action.closeActiveEditor');

        vscode.commands.executeCommand(
            "vscode.openWith",
            document.uri,
            "default"
        );

        const rPanel = vscode.window.createWebviewPanel("gbCustom.guabao", "GB Webview",
        vscode.ViewColumn.Two, { enableScripts: true });

        rPanel.webview.html = this.htmlDummy;

        function updateWebview() {
            webviewPanel.webview.postMessage({
                type: 'update',
                text: document.getText()
            });
        }
        console.log(document.getText());

        // Hook up event handlers so that we can synchronize the webview with the text document.
		//
		// The text document acts as our model, so we have to sync change in the document to our
		// editor and sync changes in the editor back to the document.
		//
		// Remember that a single text document can also be shared between multiple custom
		// editors (this happens for example when you split a custom editor)

		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				updateWebview();
			}
		});
		// Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
		});
        // Receive message from the webview.
		webviewPanel.webview.onDidReceiveMessage(e => {
			switch (e.type) {
                default:
                    console.log("webview message to onDidReceiveMesssage");
			}
		});

        // const panel = vscode.window.createWebviewPanel("catCoding", "cat coding", vscode.ViewColumn.Two, { enableScripts: true });
        updateWebview();
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        // Local path to script and css for the webview
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'asset', 'catScratch.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'asset', 'style.css'));
        // Use a nonce to whitelist which scripts can be run
        console.log(`css loaded path: ${styleUri}`);

        const nonce = getNonce();
        return /* html */`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <!--
            Use a content security policy to only allow loading images from https or from our extension directory,
            and only allow scripts that have a specific nonce.
            -->
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">

            <link href="${styleUri}" rel="stylesheet" />
            <title>GuaBao</title>
        </head>
        <body>
            <div class="notes">
                <div class="add-button">
                    <button>Test</button>
                </div>
            </div>

            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;
    }
}


// MISC functions
function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}


function send(panel:vscode.WebviewPanel, message:string) {
return panel.webview.postMessage(message);
}

function recv(panel:vscode.WebviewPanel, callback:any) {
return panel.webview.onDidReceiveMessage(callback);
}

function onDestroyed(panel:vscode.WebviewPanel, callback:any) {
return panel.onDidDispose(callback);
}

/* function reveal(panel:vscode.WebviewPanel) {
return vscode.VSC.reveal(panel, undefined, true, undefined);
}

function focus(panel:vscode.WebviewPanel) {
return VSCode.WebviewPanel.reveal(panel, undefined, undefined, undefined);
}
*/