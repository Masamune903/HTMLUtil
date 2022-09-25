/// <reference no-default-lib="true"/>
/// <reference lib="dom" />  
/// <reference lib="deno.ns" />
/// <reference lib="esnext" />

interface TargetedEvent<Tgt extends EventTarget> extends Event { currentTarget: Tgt | null }
interface TargetedHTMLElementEvent<Tgt extends HTMLElement> extends Event { currentTarget: Tgt | null }

type Attributes = { [attrName: string]: string };
type Children = (string | Node)[] | string | Node;
type Events<Tgt extends HTMLElement> = { [eventName in keyof HTMLElementEventMap]?: ((event: TargetedHTMLElementEvent<Tgt>) => void) };

type CreateHTMLElementArgs1<Elm extends HTMLElement> = [attributes: Attributes, children: Children, events?: Events<Elm>]
type CreateHTMLElementArgs2<Elm extends HTMLElement> = [children: Children, events?: Events<Elm>]

type CreateHTMLElementArgs<Elm extends HTMLElement> = [] | CreateHTMLElementArgs1<Elm> | CreateHTMLElementArgs2<Elm>;

const htmlElementCreators: {
	[tagName in keyof HTMLElementTagNameMap]: () => HTMLElementTagNameMap[tagName]
	// deno-lint-ignore no-explicit-any
} = new Proxy({} as any, {
	get(_target, name) {
		if (typeof name === "symbol")
			return undefined;
		return hecorGenerator(name);
	}
});

function hecorGenerator<TagName extends keyof HTMLElementTagNameMap>(tagName: TagName)
	: (...args: CreateHTMLElementArgs<HTMLElementTagNameMap[TagName]>) => HTMLElementTagNameMap[TagName];
function hecorGenerator<TagName extends string>(tagName: TagName)
	: (...args: CreateHTMLElementArgs<HTMLElement>) => HTMLElement;
function hecorGenerator<TagName extends keyof HTMLElementTagNameMap>(tagName: TagName) {
	type Elem = HTMLElementTagNameMap[TagName];
	type Args = CreateHTMLElementArgs<Elem>
	type Args2 = CreateHTMLElementArgs2<Elem>;
	return function createHTMLElement(
		...args: CreateHTMLElementArgs<Elem>
	) {
		const $elem: Elem = document.createElement(tagName);

		const [attrs, children, events] = (args.length === 0)
			? []
			: !((args: Args): args is Args2 => (typeof args[0] === "string" || args[0] instanceof Node || Array.isArray(args[0])))(args)
				? args
				: [undefined, ...args];

		if (attrs != null) {
			for (const [name, value] of Object.entries(attrs))
				$elem.setAttribute(name === "className" ? "class" : name, value);
		}

		if (children != null) {
			for (const child of Array.isArray(children) ? children : [children])
				$elem.append(child);
		}

		if (events != null) {
			for (const [name, handler] of Object.entries(events))
				$elem.addEventListener(name, handler as (event: TargetedEvent<EventTarget>) => void);
		}

		return $elem;
	}
}

function _createNodeFromString(htmlStr: string): Node {
	const $wrap = document.createElement("div");
	$wrap.innerHTML = htmlStr;
	return $wrap.firstChild!;
}

export { htmlElementCreators };