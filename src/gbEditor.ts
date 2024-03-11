import { Section, Block, Header, HeaderWithButtons, Paragraph, Code, Inline, Icon, Text, Snpt, Link, Horz, Vert } from './section'
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
			return renderHeader(block);
		}
		if (block instanceof HeaderWithButtons) {
			return renderHeaderWithButtons(block);
		}
		if (block instanceof Paragraph) {
			return `<div>${renderInlines(block.inlines)}</div>`
		}
		if (block instanceof Code) {
			return `<div>${renderInlines(block.inlines)}</div>`
		}
	}).join("\n")
}

function renderInlines(inlines: Inline[]): string {
	return inlines.map(inline => {
		if(inline instanceof Icon) {
			return "ICON";
		}
		if(inline instanceof Text) {
			return inline.text;
		}
		if(inline instanceof Snpt) {
			return renderInlines(inline.inlines);
		}
		if(inline instanceof Link) {
			return `${renderRange(inline.range)}: <code>${renderInlines(inline.inlines)}</code> \n ${inline.classNames}`;
		}
		if(inline instanceof Horz) {
			const columns = inline.columnns.map(col => renderInlines(col)).join("\n")
			return `Horz: ${columns}`;
		}
		if(inline instanceof Vert) {
			const rows = inline.rows.map(row => renderInlines(row)).join("\n")
			return `Vert: ${rows}`;
		}
	}).join("\n")
}

function renderHeader(header: Header): string {
	return `<div>${header.text} ${renderRange(header.range)}</div>`
}

function renderRange(range: vscode.Range | undefined): string {
	return `${adjustLineOrChar(range?.start.line)}:${adjustLineOrChar(range?.start.character)}-${adjustLineOrChar(range?.end.line)}:${adjustLineOrChar(range?.end.character)}`
}

function adjustLineOrChar(num: number | undefined): number | undefined {
	if(num === undefined) {
		return undefined;
	} else {
		return num + 1;
	}
}

function renderHeaderWithButtons(header: HeaderWithButtons): string {
	return `<div>${header.headerText} ${renderRange(header.headerLoc)} ${header.anchorText} ${renderRange(header.anchorLoc)}</div>`
}