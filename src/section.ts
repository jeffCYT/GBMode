import * as vscode from 'vscode';

export class Section {
    constructor(public deco : 'Plain' | 'Red' | 'Yellow' | 'Blue' | 'Green', public blocks: Block[]) {}
}

type Block = Header | HeaderWithButtons | Paragraph | Code;

class Header {
    constructor(public text: string, public range: vscode.Range) {}
}
class HeaderWithButtons {
    constructor(public headerText: string, public headerLoc: vscode.Range | undefined,
                public anchorText: string, public anchorLoc: vscode.Range | undefined) {}
}
class Paragraph {
    constructor(public inlines: Inline[]) {}
}
class Code {
    constructor(public inlines: Inline[]) {}
}

type Inline = Icon | Text | Snpt | Link | Sbst | Horz | Vert | Parn | PrHz

class Icon {}

class Text {}

class Snpt {}

class Link {}

class Sbst  {}

class Horz {}

class Vert {}

class Parn {}

class PrHz {}


export function getSection(response: any): Section[] {
	return [new Section('Plain', [])];
}