// This module handles specs for holes.

import * as vscode from 'vscode';

class Spec {
	constructor(public pre: string, public post: string, public range: vscode.Range) { }
}

export function getSpecs(response: any): Spec[] {
	let specs = response.contents[1].filter((m: any) => m.tag === "ResUpdateSpecs")[0].contents;
	let processed = specs.map((spec: any) => {
		const pre = spec[1];
		const post = spec[2];
		const originalRange = spec[3];
		const range = new vscode.Range(new vscode.Position(originalRange[0][1] - 1, originalRange[0][2] + 1),
									   new vscode.Position(originalRange[1][1] - 1, originalRange[1][2] - 1));
		return new Spec(pre, post, range);
	})
	return processed;
}