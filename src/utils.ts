import * as vscode from 'vscode';

export function retrieveMainEditor(): vscode.TextEditor {
	return vscode.window.visibleTextEditors[0];
}

export class RangeWithOffset {
    constructor(public path: string, public startLine: number, public startChar: number, public startOff: number, public endLine: number, public endChar: number, public endOff: number) {}
}

export function genRangeWithOffset(editor: vscode.TextEditor): RangeWithOffset {
	const path = editor?.document.uri.fsPath;
	const selection = editor?.selection;
	// Note that the position is prone to off-by-one error.
	const startLine = (selection?.start.line ?? 0) + 1;
	const startChar = (selection?.start.character ?? 0) + 1;
	// Not sure if the default value Position(0, 0) is a good idea,
	// but at least I haven't encountered any problems. 
	const startOff = editor?.document.offsetAt(selection?.start || new vscode.Position(0, 0));
	const endLine = (selection?.end.line ?? 0) + 1;
	const endChar = (selection?.end.character ?? 0) + 1;
	const endOff = editor?.document.offsetAt(selection?.end || new vscode.Position(0, 0));
	return new RangeWithOffset(path, startLine, startChar, startOff, endLine, endChar, endOff);
}