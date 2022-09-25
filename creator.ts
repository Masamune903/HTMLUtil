/// <reference no-default-lib="true"/>
/// <reference lib="dom" />  
/// <reference lib="deno.ns" />
/// <reference lib="esnext" />

interface TargetedEvent<Tgt extends EventTarget> extends Event { currentTarget: Tgt | null }
interface TargetedHTMLElementEvent<Tgt extends HTMLElement> extends Event { currentTarget: Tgt | null }

type Attributes = { [attrName: string]: string };
type Children = (string | Node)[] | string | Node;
type Events<Tgt extends HTMLElement> = { [eventName in keyof HTMLElementEventMap]?: ((event: TargetedHTMLElementEvent<Tgt>) => void) };

type HTMLElementCreatorArgs1<Elm extends HTMLElement> = [attributes: Attributes, children: Children, events?: Events<Elm>];
type HTMLElementCreatorArgs2<Elm extends HTMLElement> = [children: Children, events?: Events<Elm>];
type HTMLElementCreatorArgs<Elm extends HTMLElement> = [] | HTMLElementCreatorArgs1<Elm> | HTMLElementCreatorArgs2<Elm>;

type HTMLElementCreator<E extends HTMLElement> = (...args: HTMLElementCreatorArgs<E>) => E;

const htmlElementCreators: {
	[tagName in keyof HTMLElementTagNameMap]: (...args: HTMLElementCreatorArgs<HTMLElementTagNameMap[tagName]>) => HTMLElementTagNameMap[tagName];
} & {
	custom<Elm extends HTMLElement>(customElementConstructor: { new(): Elm; tagName: string; }, ...args: HTMLElementCreatorArgs<Elm>): Elm;
	// deno-lint-ignore no-explicit-any
} = new Proxy({
	custom<Elm extends HTMLElement>(customElementConstructor: { new(): Elm; tagName: string; }, ...args: HTMLElementCreatorArgs<HTMLElement>): Elm {
		return hecorGenerator(customElementConstructor.tagName)(...args) as Elm;
	}
} as any, {
	get(target, name) {
		if (typeof name === "symbol")
			return target[name];
		if (name === "custom")
			return target[name];
		return hecorGenerator(name);
	}
});

function hecorGenerator<TagName extends keyof HTMLElementTagNameMap>(tagName: TagName)
	: (...args: HTMLElementCreatorArgs<HTMLElementTagNameMap[TagName]>) => HTMLElementTagNameMap[TagName];
function hecorGenerator<TagName extends string>(tagName: TagName)
	: (...args: HTMLElementCreatorArgs<HTMLElement>) => HTMLElement;
function hecorGenerator<TagName extends keyof HTMLElementTagNameMap>(tagName: TagName) {
	type Elem = HTMLElementTagNameMap[TagName];
	type Args = HTMLElementCreatorArgs<Elem>
	type Args2 = HTMLElementCreatorArgs2<Elem>;
	return function createHTMLElement(
		...args: HTMLElementCreatorArgs<Elem>
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