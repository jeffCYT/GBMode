import * as vscode from 'vscode';

/* CustomTextEditorProvider for GuaBao */

export class GBEditorProvider implements vscode.CustomTextEditorProvider {
    private static readonly viewType = 'gbCustom.guabao';

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
        // Setup initial content for the webview
        webviewPanel.webview.options = {
            enableScripts: true
        };
        function updateWebview() {
            webviewPanel.webview.postMessage({
                type: 'update',
                text: document.getText()
            });
        }
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
            this.context.extensionUri, 'media', 'catScratch.js'));
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'media', 'reset.css'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'media', 'vscode.css'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'media', 'catScratch.css'));

        // Use a nonce to whitelist which scripts can be run
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

            <link href="${styleResetUri}" rel="stylesheet" />
            <link href="${styleVSCodeUri}" rel="stylesheet" />
            <link href="${styleMainUri}" rel="stylesheet" />

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