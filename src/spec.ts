// This module handles specs for holes.

import * as vscode from 'vscode';

// The class for specs.
class Spec {
	constructor(public pre: string, public post: string, public range: vscode.Range) { }
}

export function getSpecs(response: any): Spec[] {
	const specs = response.contents[1].filter((m: any) => m.tag === "ResUpdateSpecs")[0].contents;
	const processed = specs.map((spec: any) => {
		const pre = spec[1];
		const post = spec[2];
		const originalRange = spec[3];
		// We have to deal with off-by-one error here.
		const range = new vscode.Range(new vscode.Position(originalRange[0][1] - 1, originalRange[0][2] + 1),
									   new vscode.Position(originalRange[1][1] - 1, originalRange[1][2] - 1));
		return new Spec(pre, post, range);
	})
	return processed;
}