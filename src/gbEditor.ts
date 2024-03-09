import { Section, Block, Header, HeaderWithButtons, Paragraph, Code } from './section'
import * as vscode from 'vscode';

export class PanelProvider {
	static panel: vscode.WebviewPanel;
	createPanel(): void {
		PanelProvider.panel = vscode.window.createWebviewPanel("gbCustom.guabao", "GB Webview",
		                                                       vscode.ViewColumn.Two, { enableScripts: true });
	}
	format(content: Section[] | string): void {
		if(typeof content === 'string') {
			PanelProvider.panel.webview.html = `<!DOCTYPE html><html lang="en"><head></head><body><h2> Testing GB</h2><p>${content}</p></body></html>`;
		} else if (content.every(it => it instanceof Section)){
			PanelProvider.panel.webview.html = renderSections(content);
		}
	}
}

function renderSections(content: Section[]): string {
	let rendered = content.map(section => section.deco + renderBlocks(section.blocks)).join(' ');
	return rendered;
}

function renderBlocks(blocks: Block[]): string {
	return blocks.map(block => {
		if (block instanceof Header) {
			return `<div>${block.text} ${block.range}</div>`
		}
		if (block instanceof HeaderWithButtons) {
			return `<div>${block.headerText} ${block.headerLoc} ${block.anchorText} ${block.anchorLoc}</div>`
		}
		if (block instanceof Paragraph) {
			return `<div>${block.inlines}</div>`
		}
		if (block instanceof Code) {
			return `<div>${block.inlines}</div>`
		}
	}).join()
}