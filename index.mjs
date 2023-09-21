#!/usr/bin/env node

import { setTimeout } from 'node:timers/promises';
import path from 'node:path'
import { fileURLToPath } from 'node:url';
import { cp } from 'node:fs/promises';
import color from 'picocolors';
import * as p from '@clack/prompts';

async function main() {
	console.clear();

	await setTimeout(1000);

	p.intro(`${color.bgCyan(color.black(' create-appncy '))}`);

	const project = await p.group(
		{
			template: () =>
				p.select({
					message: `Which template would you like to use?`,
					initialValue: 'next-eslint-ts-tw',
					options: [
						{ value: 'next-eslint-ts-tw', label: 'Next.js + ESLint + TypeScript + Tailwind' },
					],
				}),
			path: () =>
				p.text({
					message: 'What is the name of your project?',
					placeholder: 'appncy-project',
					defaultValue: 'appncy-project',
				}),
		},
		{
			onCancel: () => {
				p.cancel('Operation cancelled.');
				process.exit(0);
			},
		}
	);

	const s = p.spinner();

	s.start('Creating project');

	await cp(
		path.join(path.dirname(fileURLToPath(import.meta.url)), 'templates', project.template),
		path.join(process.cwd(), project.path),
		{ recursive: true }
	)

	s.stop('Project created');

	p.note(`cd ${project.path}\npnpm install\npnpm dev`, 'Next steps.');

	p.outro(`Questions? ${color.underline(color.cyan('https://x.com/goncy'))}`);
}

main().catch(console.error);