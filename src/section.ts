import * as vscode from 'vscode';

export class Section {
    constructor(public deco : 'Plain' | 'Red' | 'Yellow' | 'Blue' | 'Green', public blocks: Block[]) {}
}

export type Block = Header | HeaderWithButtons | Paragraph | Code;

export class Header {
    constructor(public text: string, public range: vscode.Range) {}
}

export class HeaderWithButtons {
    constructor(public headerText: string, public headerLoc: vscode.Range | undefined,
                public anchorText: string, public anchorLoc: vscode.Range | undefined) {}
}

export class Paragraph {
    constructor(public inlines: Inline[]) {}
}

export class Code {
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


export function getSections(response: any): Section[] {
    const sections = response.contents[1].filter((m: any) => m.tag === "ResDisplay")[0].contents[1]
    let result: Section[] = [];
    for(let arr of (sections as any[])) {
        result.push(new Section(arr[0], getBlocks(arr[1])));
    };
    return result;
}

function getBlocks(response: any): Block[] {
    return response.map((res: any) => {
        switch(res.tag) {
            case 'Header':
                return new Header(res.contents[0], getRange(res.contents[1]));
            case 'HeaderWithButtons':
                return new HeaderWithButtons(res.contents[0], getRange(res.contents[1]), res.contents[2], getRange(res.contents[3]));
            case 'Paragraph':
                return new Paragraph(getInlines(res.contents[0]));
            case 'Code':
                return new Code(getInlines(res.contents[0]));
        }
    })
}

function getInlines(response: any): Inline[] { // FIXME: implement this
    return [];
}

function getRange(response: any): vscode.Range { // FIXME: implement this and remember to handle null
    return new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));
}