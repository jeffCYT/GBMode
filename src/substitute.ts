import { Inline, getInlines } from "./section";

class Substitution {
	constructor(public redexNumber: number, public inlines: Inline[]) { }
}

export function getSubstitutions(response: any): Substitution[] {
	let substitution = response.contents[1].filter((m: any) => m.tag === "ResSubstitute")[0].contents;
	return [new Substitution(substitution[0], getInlines(substitution[1]))];
}