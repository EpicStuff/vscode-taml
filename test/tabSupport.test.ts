/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import assert = require('assert');
import { activate, getDocPath, getDocUri, sleep, resetSettings, updateSettings } from './helper';

describe('YAML with tab indentation', () => {
  const fixturePath = getDocPath('tab-indented.yaml');
  const docUri = getDocUri('tab-indented.yaml');
  const schemaPath = path.join(__dirname, '..', '..', 'test', 'testFixture', 'schemas', 'tab_indented_schema.json');

  let originalBytes: Buffer;

  before(() => {
    originalBytes = fs.readFileSync(fixturePath);
  });

  afterEach(async () => {
    await resetSettings('schemas', {});
  });

  after(() => {
    vscode.window.tabGroups.close(vscode.window.tabGroups.activeTabGroup);
  });

  it('produces no diagnostics for a schema-conformant tab-indented YAML file', async () => {
    await activate(docUri);
    await updateSettings('schemas', {
      [vscode.Uri.file(schemaPath).toString()]: 'tab-indented.yaml',
    });
    // Give the server a moment to revalidate after the schema association lands.
    await sleep(1500);

    const diagnostics = vscode.languages.getDiagnostics(docUri);
    assert.deepEqual(
      diagnostics.map((d) => d.message),
      [],
      `expected no diagnostics, got: ${JSON.stringify(diagnostics.map((d) => d.message))}`
    );
  });

  it('leaves the file bytes on disk unchanged', () => {
    const currentBytes = fs.readFileSync(fixturePath);
    assert.ok(currentBytes.equals(originalBytes), 'on-disk fixture must remain byte-identical');
    // Sanity: the tab character is still present at the expected offset.
    assert.equal(currentBytes.indexOf(0x09), 7, 'tab byte must still be at offset 7');
  });

  it('offers schema-driven completions on a tab-indented document', async () => {
    // Use the schema-contributor extension API to bind the schema. The
    // `yaml.schemas` settings path is currently broken upstream in this build
    // of yaml-language-server (the same failure mode is visible across the
    // pre-existing schemaModification / completion suites).
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const client = await activate(docUri);
    client._customSchemaContributors = {};
    client.registerContributor(
      'tab-indented-schema',
      (resource: string) => (resource.endsWith('tab-indented.yaml') ? 'tab-indented-schema://schema/test' : undefined),
      () => schemaContent
    );
    await sleep(1500);

    // Position at the very start of the document. The schema declares a top-level
    // property `schema_only_top_key` that never appears in the file, so it can
    // only show up if the server is parsing the document with the schema applied.
    const list = (await vscode.commands.executeCommand(
      'vscode.executeCompletionItemProvider',
      docUri,
      new vscode.Position(0, 0)
    )) as vscode.CompletionList;

    const labels = (list?.items ?? []).map((i) => (typeof i.label === 'string' ? i.label : i.label.label));
    assert.ok(
      labels.includes('schema_only_top_key'),
      `expected schema-aware completion to include "schema_only_top_key", got: ${JSON.stringify(labels)}`
    );
  });
});
