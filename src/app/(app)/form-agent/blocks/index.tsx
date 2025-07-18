import {
	type AnyBlock,
	createBlock,
	createStatefulBlock,
} from "@rubriclab/blocks";
import { z } from "zod/v4";
import { raw } from "../brands";
import { form } from "./form";
import { select } from "./select";
import { TextInput } from "./textInput";

export const staticBlocks = {
	paragraph: createBlock({
		description: "Render a text input",
		render: (text) => <p>{text}</p>,
		schema: {
			input: raw(z.string()),
		},
	}),
	textInput: createStatefulBlock({
		description: "Render a text input",
		render: () => ({
			component: ({ emit }) => <TextInput emit={emit} />,
			initialState: "",
		}),
		schema: {
			input: raw(z.null()),
			output: z.string(),
		},
	}),
};

export const genericBlocks = {
	form,
	select,
};

export const blocksMap = new Map<string, AnyBlock>(
	Object.entries(staticBlocks),
);

export function getBlocks() {
	return Object.fromEntries(blocksMap) as Record<string, AnyBlock>;
}

export function addBlock({ name, block }: { name: string; block: AnyBlock }) {
	blocksMap.set(name, block);
}
