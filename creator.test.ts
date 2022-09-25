import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { htmlElementCreators } from "./creator.ts";

Deno.test("htmlElementCreator", _ctx => {
	const $div = htmlElementCreators.div();
	assertEquals($div instanceof HTMLDivElement);
});
