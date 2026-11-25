# M37 — Archive schema and automated validation

**Status:** Validator and CI baseline added  
**Depends on:** M25–M34; supports every future content milestone.

## Goal

Make the archive a trustworthy source of truth. New records should fail validation before they become broken visitor experiences.

## Baseline changes

- Add a dependency-free Node.js validator.
- Check required fields, unique IDs, category mapping, stock status, local file/image/project paths, curated relationship targets, duplicate HTML IDs and runtime script paths.
- Run the validator automatically in GitHub Actions for relevant pushes and pull requests.
- Correct the README authoring example to use the file property, not the unsupported textFile property.

## Remaining scope

1. Move all content records and pending records into the archive data source; runtime modules should not invent or migrate editorial content.
2. Define a documented schema for project, voicebank, image, video, audio, text and performance records.
3. Validate optional fields by record type (for example, media paths, voice credits, project dossiers and archive dates).
4. Add checks for Markdown relative links and media-manifest consistency.
5. Add fixtures for valid and invalid archive records.
6. Keep migration scripts explicit, versioned and removable after migration.

## Acceptance criteria

- The archive source contains every visitor-facing record.
- Runtime modules never add, rename or delete editorial records.
- Invalid IDs, categories, stock states, relationships and local paths fail CI.
- Each record type has a clear contract and a useful validation message.
- The README and data guide show examples that match the actual renderer.
