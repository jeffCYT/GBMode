import { Section, Block, Header, HeaderWithButtons, Paragraph, Code, Inline, Icon, Text, Snpt, Link, Sbst, Horz, Vert, Parn } from './section'
import * as vscode from 'vscode';
import * as path from 'path';

export class PanelProvider {
	static panel: vscode.WebviewPanel;
	initiated(): boolean {
		return PanelProvider.panel !== undefined
	}
	createPanel(): void {
		PanelProvider.panel = vscode.window.createWebviewPanel("gbCustom.guabao", "GB Webview",
		                                                       vscode.ViewColumn.Two, { enableScripts: true });
	}
	format(content: Section[] | string, extPath: string): void {
		// This is for debugging purpose.
		// If the argument is a string instead of a section, we print it out in the simplest way.
		if(typeof content === 'string') {
			PanelProvider.panel.webview.html = `<!DOCTYPE html><html lang="en"><head></head><body><h2>Testing GB</h2><p>${content}</p></body></html>`;
		} else if (content.every(it => it instanceof Section)){
			PanelProvider.panel.webview.html = renderSections(content, extPath);
		}
	}
	receiveMessage(context: vscode.ExtensionContext) {
		const decorationType = vscode.window.createTextEditorDecorationType({
			borderWidth: '1px',
			borderStyle: 'solid',
			overviewRulerColor: 'blue',
			overviewRulerLane: vscode.OverviewRulerLane.Right,
			light: {
				// this color will be used in light color themes
				borderColor: 'darkblue'
			},
			dark: {
				// this color will be used in dark color themes
				borderColor: 'lightblue'
			}
		});
		PanelProvider.panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'decorate':
						vscode.window.visibleTextEditors[0].setDecorations(decorationType, [new vscode.Range(new vscode.Position(message.startLine, message.startChar), new vscode.Position(message.endLine, message.endChar))]);
						return;
					case 'undecorate':
						vscode.window.visibleTextEditors[0].setDecorations(decorationType, []);
						return;
				}
			},
			undefined,
			context.subscriptions
		  );
	}
}

// The below renderXXXXX functions turn the parsed data structure into HTML.

function renderSections(sections: Section[], extPath: string): string {
	const webview = PanelProvider.panel.webview;
	const stylePathOnDisk = vscode.Uri.file(path.join(extPath, '/asset/bootstrap.min.css'));
	const styleUri = webview.asWebviewUri(stylePathOnDisk);

	const content = sections.map(section => {
		switch(section.deco) {
			case 'Plain':
				return `<div class="border rounded p-3">${renderBlocks(section.blocks)}</div>`;
			case 'Red':
				return `<div class="text-danger border rounded p-3">${renderBlocks(section.blocks)}</div>`;
			case 'Yellow':
				return `<div class="text-warning border rounded p-3">${renderBlocks(section.blocks)}</div>`;
			case 'Blue':
				return `<div class="text-primary border rounded p-3">${renderBlocks(section.blocks)}</div>`;
			case 'Green':
				return `<div class="text-success border rounded p-3">${renderBlocks(section.blocks)}</div>`;
		}
	}).join('<br>')

	return `
		<!DOCTYPE html>
		<html lang="en" data-bs-theme="dark">
			<head>
				<title>GB Webview</title>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link rel='stylesheet' type='text/css' href='${styleUri}'>
			</head>
			<body>
				${content}
				<script>
					const vscode = acquireVsCodeApi();
					function decorateCode(startLine, startChar, endLine, endChar) {
						vscode.postMessage({
							command: 'decorate',
							startLine: startLine,
							startChar: startChar,
							endLine: endLine,
							endChar: endChar
						});
					}
					function undecorateCode() {
						vscode.postMessage({
							command: 'undecorate'
						});
					}
				</script>
			</body>
		</html>
	`;
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
			return `<div class="container">${renderInlines(block.inlines)}</div>`
		}
		if (block instanceof Code) {
			return `<div class="container">${renderInlines(block.inlines)}</div>`
		}
	}).join("\n")
}

function renderHeader(header: Header): string {
	return `<h2>${header.text} ${renderRange(header.range)}</h2>`
}

function renderHeaderWithButtons(header: HeaderWithButtons): string {
	return `<h2>${header.headerText} ${renderRange(header.headerLoc)} ${header.anchorText} ${renderRange(header.anchorLoc)}</h2>`
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
			return ` <code>${renderInlines(inline.inlines)}</code> `;
		}
		if(inline instanceof Link) {
			return `
				<span
					data-bs-toggle="tooltip"
					title="${renderRange(inline.range)}"
					onmouseover="decorateCode(${inline.range?.start.line}, ${inline.range?.start.character}, ${inline.range?.end.line}, ${inline.range?.end.character})"		
					onmouseout="undecorateCode()"
				>
					${renderInlines(inline.inlines)}
				</span>
			`; // omit `inline.classNames`
		}
		if(inline instanceof Sbst) {
			return `${renderInlines(inline.inlines)}` // omit `inline.iDontKnowWhatThisIs`
		}
		if(inline instanceof Horz) {
			const columns = inline.columnns.map(col => renderInlines(col)).join("")
			return `${columns}`;
		}
		if(inline instanceof Vert) {
			const rows = inline.rows.map(row => renderInlines(row)).join("<br>")
			return `<br><div class="text-center">${rows}</div><br>`;
		}
		if(inline instanceof Parn) {
			return `(${renderInlines(inline.inlines)})`;
		}
	}).join("")
}

function renderRange(range: vscode.Range | undefined): string {
	return `${adjustLineOrChar(range?.start.line)}:${adjustLineOrChar(range?.start.character)}-${adjustLineOrChar(range?.end.line)}:${adjustLineOrChar(range?.end.character)}`
}

// This fixes the off-by-one error.
function adjustLineOrChar(num: number | undefined): number | undefined {
	if(num === undefined) {
		return undefined;
	} else {
		return num + 1;
	}
}