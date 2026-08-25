import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="target"></div></body></html>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
try {
	Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
} catch {}
globalThis.Element = dom.window.Element;
globalThis.Node = dom.window.Node;
globalThis.Text = dom.window.Text;
globalThis.Comment = dom.window.Comment;
globalThis.DocumentFragment = dom.window.DocumentFragment;

import * as $ from '../../../packages/svelte/src/internal/client/index.js';
import { init_operations } from '../../../packages/svelte/src/internal/client/dom/operations.js';
import { fastest_test } from '../../utils.js';

init_operations();

function build_data(count) {
	const adjectives = ['pretty', 'large', 'big', 'small', 'tall', 'short', 'long', 'handsome', 'plain', 'quaint'];
	const colours = ['red', 'yellow', 'blue', 'green', 'pink', 'brown', 'purple', 'brown', 'white', 'black'];
	const nouns = ['table', 'chair', 'house', 'bbq', 'desk', 'car', 'pony', 'cookie', 'sandwich', 'burger'];
	const data = new Array(count);
	for (let i = 0; i < count; i++) {
		data[i] = {
			id: i + 1,
			label: `${adjectives[i % adjectives.length]} ${colours[i % colours.length]} ${nouns[i % nouns.length]}`
		};
	}
	return data;
}

const template_row = $.from_html('<tr><td class="col-md-1"> </td><td class="col-md-4"><a> </a></td><td class="col-md-1"><a> </a></td><td class="col-md-6"></td></tr>', 0);

function render_row(anchor, item, index, get_collection) {
	const row = template_row();
	const td1 = $.child(row, false);
	const text1 = $.child(td1, true);
	$.set_text(text1, item.id);
	const td2 = $.sibling(td1, 1, false);
	const a1 = $.child(td2, false);
	const text2 = $.child(a1, true);
	$.set_text(text2, item.label);
	anchor.before(row);
}

function get_key(item) {
	return item.id;
}

export const dom_benchmarks = [
	{
		label: 'dom_each_run_1000',
		fn: async () => {
			return await fastest_test(10, () => {
				const target = document.createElement('tbody');
				document.body.appendChild(target);
				const data = build_data(1000);
				const data_source = $.state(data);

				const cleanup = $.effect_root(() => {
					$.each(target, 0, () => $.get(data_source), get_key, render_row);
				});

				cleanup();
				target.remove();
			});
		}
	},
	{
		label: 'dom_each_replace_1000',
		fn: async () => {
			return await fastest_test(10, () => {
				const target = document.createElement('tbody');
				document.body.appendChild(target);
				const data_source = $.state(build_data(1000));

				const cleanup = $.effect_root(() => {
					$.each(target, 0, () => $.get(data_source), get_key, render_row);
				});

				$.set(data_source, build_data(1000));

				cleanup();
				target.remove();
			});
		}
	},
	{
		label: 'dom_each_swap_1000',
		fn: async () => {
			return await fastest_test(10, () => {
				const target = document.createElement('tbody');
				document.body.appendChild(target);
				const initial = build_data(1000);
				const data_source = $.state(initial);

				const cleanup = $.effect_root(() => {
					$.each(target, 0, () => $.get(data_source), get_key, render_row);
				});

				const swapped = initial.slice();
				const temp = swapped[1];
				swapped[1] = swapped[998];
				swapped[998] = temp;
				$.set(data_source, swapped);

				cleanup();
				target.remove();
			});
		}
	},
	{
		label: 'dom_each_clear_1000',
		fn: async () => {
			return await fastest_test(10, () => {
				const target = document.createElement('tbody');
				document.body.appendChild(target);
				const data_source = $.state(build_data(1000));

				const cleanup = $.effect_root(() => {
					$.each(target, 0, () => $.get(data_source), get_key, render_row);
				});

				$.set(data_source, []);

				cleanup();
				target.remove();
			});
		}
	},
	{
		label: 'dom_each_select_1000',
		fn: async () => {
			return await fastest_test(10, () => {
				const target = document.createElement('tbody');
				document.body.appendChild(target);
				const data = build_data(1000);
				const data_source = $.state(data);
				const selected_source = $.state(null);

				const cleanup = $.effect_root(() => {
					$.each(target, 0, () => $.get(data_source), get_key, (anchor, item) => {
						const row = template_row();
						let classes;
						$.render_effect(() => {
							classes = $.set_class(row, 1, '', null, classes, { danger: $.get(selected_source) === item.id });
						});
						const td1 = $.child(row, false);
						const text1 = $.child(td1, true);
						$.set_text(text1, item.id);
						const td2 = $.sibling(td1, 1, false);
						const a1 = $.child(td2, false);
						const text2 = $.child(a1, true);
						$.set_text(text2, item.label);
						anchor.before(row);
					});
				});

				$.set(selected_source, 500);

				cleanup();
				target.remove();
			});
		}
	},
	{
		label: 'dom_each_select_lots_1000',
		fn: async () => {
			return await fastest_test(10, () => {
				const target = document.createElement('tbody');
				document.body.appendChild(target);
				const data = build_data(1000);
				const data_source = $.state(data);
				const selected_source = $.state(null);

				const cleanup = $.effect_root(() => {
					$.each(target, 0, () => $.get(data_source), get_key, (anchor, item) => {
						const row = template_row();
						let classes;
						$.render_effect(() => {
							classes = $.set_class(row, 1, '', null, classes, { danger: $.get(selected_source) === item.id });
						});
						const td1 = $.child(row, false);
						const text1 = $.child(td1, true);
						$.set_text(text1, item.id);
						const td2 = $.sibling(td1, 1, false);
						const a1 = $.child(td2, false);
						const text2 = $.child(a1, true);
						$.set_text(text2, item.label);
						anchor.before(row);
					});
				});

				for (let i = 0; i < 20; i++) {
					$.set(selected_source, i * 50 + 1);
				}

				cleanup();
				target.remove();
			});
		}
	}
];
