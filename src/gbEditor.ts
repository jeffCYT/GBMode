import { Section } from './section'
import * as vscode from 'vscode';

export class PanelProvider {
	static panel: vscode.WebviewPanel;
	createPanel(): void {
		PanelProvider.panel = vscode.window.createWebviewPanel("gbCustom.guabao", "GB Webview",
		                                                       vscode.ViewColumn.Two, { enableScripts: true });
	}
	format(content: Section[] | String): void {
		PanelProvider.panel.webview.html = `<!DOCTYPE html><html lang="en"><head></head><body><h2> Testing GB</h2><p>${content}</p></body></html>`;
	}
}