import { html } from "../mod.ts";

export class My_Component extends HTMLElement {
	static tagName: "my-component";
	constructor() {
		super();
	}
}

const $my = html.custom(My_Component, [], {
	click: e => e.currentTarget
});