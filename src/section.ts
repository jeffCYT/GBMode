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

class Icon {
    constructor(public name: string, public classNames: string[]) {}
}

class Text {
    constructor(public text: string, public classNames: string[]) {}
}

class Snpt {
    constructor(public inlines: Inline[]) {}
}

class Link {
    constructor(public range: vscode.Range, public inlines: Inline[], classNames: string[]) {}
}

class Sbst {
    constructor(public iDontKnowWhatThisIs: number, public inlines: Inline[]) {}
}

class Horz {
    constructor(public columnns: Inline[][]) {}
}

class Vert {
    constructor(public rows: Inline[][]) {}
}

class Parn {
    constructor(public inlines: Inline[]) {}
}

class PrHz {
    constructor(public columns: Inline[][]) {}
}


export function getSection(response: any): Section[] {
	return [new Section('Plain', [])];
}