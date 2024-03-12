import * as vscode from 'vscode';

export class Section {
    constructor(public deco : 'Plain' | 'Red' | 'Yellow' | 'Blue' | 'Green', public blocks: Block[]) {}
}

export type Block = Header | HeaderWithButtons | Paragraph | Code;

export class Header {
    constructor(public text: string, public range: vscode.Range | undefined) {}
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

export type Inline = Icon | Text | Snpt | Link | Sbst | Horz | Vert | Parn | PrHz

export class Icon {
    constructor(public name: string, public classNames: string[]) {}
}

export class Text {
    constructor(public text: string, public classNames: string[]) {}
}

export class Snpt {
    constructor(public inlines: Inline[]) {}
}

export class Link {
    constructor(public range: vscode.Range | undefined, public inlines: Inline[], public classNames: string[]) {}
}

export class Sbst {
    constructor(public iDontKnowWhatThisIs: number, public inlines: Inline[]) {}
}

export class Horz {
    constructor(public columnns: Inline[][]) {}
}

export class Vert {
    constructor(public rows: Inline[][]) {}
}

export class Parn {
    constructor(public inlines: Inline[]) {}
}

export class PrHz {
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
                return new Paragraph(getInlines(res.contents));
            case 'Code':
                return new Code(getInlines(res.contents));
        }
    })
}

function getInlines(response: any): Inline[] {
    if(response) {
        let result: Inline[] = [];
        for(let content of (response as any[])) {
            switch(content.tag) {
                case 'Icon':
                    result.push(new Icon(content.contents[0], content.contents[1]));
                    break;
                case 'Text':
                    result.push(new Text(content.contents[0], content.contents[1]));
                    break;
                case 'Snpt':
                    result.push(new Snpt(getInlines(content.contents)));
                    break;
                case 'Link':
                    result.push(new Link(getRange(content.contents[0]), getInlines(content.contents[1]), content.contents[2]));
                    break;
                case 'Sbst':
                    result.push(new Sbst(content.contents[0], getInlines(content.contents[1])));
                    break;
                case 'Horz':
                    result.push(new Horz(content.contents.map((inlines: any) => getInlines(inlines))));
                    break;
                case 'Vert':
                    result.push(new Vert(content.contents.map((inlines: any) => getInlines(inlines))));
                    break;
                case 'Parn':
                    result.push(new Parn(getInlines(content.contents)));
                    break;
            }
        };
        return result;
    } else {
        return [];
    }
}

function getRange(response: any): vscode.Range | undefined {
    if(response === null) {
        return undefined;
    } else {
        const range = new vscode.Range(new vscode.Position(response[0][1] - 1, response[0][2] - 1), new vscode.Position(response[1][1] - 1, response[1][2] - 1));
        return range;
    }
}