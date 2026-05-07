import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import {
  asText,
  createClient,
  createMigration,
  createWriteClient,
} from "@prismicio/client";

const { loadEnvConfig } = nextEnv;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

loadEnvConfig(projectRoot);

const LOCALE_ALIASES = {
  en: "en-us",
  "en-us": "en-us",
  es: "es-es",
  "es-es": "es-es",
};

const UI_COPY_FILE_BY_LANG = {
  "en-us": path.join(projectRoot, "src", "locales", "ui", "en.json"),
  "es-es": path.join(projectRoot, "src", "locales", "ui", "es.json"),
};

const NON_TRANSLATABLE_TEXT_FIELD_PATTERN =
  /(^|[^a-z0-9])(url|urls|embed|youtube_url|background_color)([^a-z0-9]|$)/i;

const TRANSCRIPTION_VERSION = 2;

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));

  if (!command || options.help) {
    printHelp();
    return;
  }

  if (command === "export") {
    await runExport(options);
    return;
  }

  if (command === "import") {
    await runImport(options);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = {};

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];

    if (!token.startsWith("--")) {
      continue;
    }

    const [rawKey, inlineValue] = token.slice(2).split("=", 2);
    const key = rawKey.trim();

    if (!key) {
      continue;
    }

    if (inlineValue !== undefined) {
      options[key] = inlineValue;
      continue;
    }

    const next = rest[index + 1];
    if (!next || next.startsWith("--")) {
      options[key] = true;
      continue;
    }

    options[key] = next;
    index += 1;
  }

  return { command, options };
}

function printHelp() {
  console.log(`
Prismic translation workflow

Export:
  npm run prismic:translations:export -- --from en --to es
  npm run prismic:translations:export -- --from en-us --to es-es --out translations/hotc-en-to-es.json

Import:
  npm run prismic:translations:import -- --file translations/hotc-en-to-es.json
  npm run prismic:translations:import -- --file translations/hotc-en-to-es.json --dry-run

Environment:
  PRISMIC_ACCESS_TOKEN   Optional. Needed if the Content API is protected.
  PRISMIC_WRITE_TOKEN    Required for import unless using --dry-run.
  PRISMIC_REPOSITORY     Optional override for the Prismic repository name.

Notes:
  - Export creates a JSON file for round-tripping and a Markdown file for review.
  - Import writes to a Prismic migration release. Review and publish in Prismic after import.
  - Rich Text units keep Prismic's JSON structure. Translate text content inside "target".
`);
}

async function runExport(options) {
  const sourceLang = normalizeLocale(options.from);
  const targetLang = normalizeLocale(options.to);

  if (!sourceLang || !targetLang) {
    throw new Error("Export requires --from and --to locales.");
  }

  const config = await loadPrismicConfig();
  const customTypeModels = await loadCustomTypeModels();
  const sliceModels = await loadSliceModels();
  const client = createReadClient(config.repositoryName);
  const documents = await fetchSourceDocuments(client, customTypeModels, sourceLang);
  const requestedTypes = parseCsv(options.types);
  const filteredDocuments = documents.filter((document) =>
    requestedTypes.length > 0 ? requestedTypes.includes(document.type) : true,
  );

  const payloadDocuments = [];

  for (const sourceDocument of filteredDocuments) {
    const targetDocument = await fetchLocalizedCounterpart(
      client,
      customTypeModels[sourceDocument.type],
      sourceDocument,
      targetLang,
    );
    const units = extractTranslationUnits({
      document: sourceDocument,
      customTypeModel: customTypeModels[sourceDocument.type],
      sliceModels,
    });

    if (units.length === 0) {
      continue;
    }

    payloadDocuments.push({
      key: getDocumentKey(sourceDocument),
      type: sourceDocument.type,
      uid: sourceDocument.uid ?? null,
      sourceDocumentId: sourceDocument.id,
      sourceLang,
      targetLang,
      targetDocumentId: targetDocument?.id ?? null,
      targetExists: Boolean(targetDocument),
      title: getDocumentDisplayTitle(sourceDocument),
      units,
    });
  }

  const localResources = await exportLocalResources(sourceLang, targetLang);

  const outputPath = path.resolve(
    projectRoot,
    options.out || defaultExportPath(sourceLang, targetLang),
  );
  const markdownPath = outputPath.replace(/\.json$/i, ".md");

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  const payload = {
    version: TRANSCRIPTION_VERSION,
    repositoryName: config.repositoryName,
    exportedAt: new Date().toISOString(),
    sourceLang,
    targetLang,
    documentCount: payloadDocuments.length,
    localResourceCount: localResources.length,
    notes: [
      "Translate the value inside each unit.target field.",
      "For richText units, preserve the array/object structure and only translate text content.",
      "Local UI copy entries update JSON dictionaries in src/locales/ui during import.",
      "Import writes to a Prismic migration release and does not publish automatically.",
    ],
    documents: payloadDocuments,
    localResources,
  };

  await fs.writeFile(outputPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
  await fs.writeFile(markdownPath, buildMarkdownSummary(payload), "utf8");

  console.log(
    `Exported ${payloadDocuments.length} Prismic documents and ${localResources.length} local resources to ${outputPath}`,
  );
  console.log(`Review copy written to ${markdownPath}`);
}

async function runImport(options) {
  const filePath = options.file
    ? path.resolve(projectRoot, options.file)
    : null;

  if (!filePath) {
    throw new Error("Import requires --file.");
  }

  const raw = await fs.readFile(filePath, "utf8");
  const payload = JSON.parse(raw);

  if (payload.version !== TRANSCRIPTION_VERSION) {
    throw new Error(
      `Unsupported translation file version: ${payload.version}. Expected ${TRANSCRIPTION_VERSION}.`,
    );
  }

  const config = await loadPrismicConfig();
  if (payload.repositoryName && payload.repositoryName !== config.repositoryName) {
    throw new Error(
      `Translation file targets repository "${payload.repositoryName}", but local config resolves to "${config.repositoryName}".`,
    );
  }

  const customTypeModels = await loadCustomTypeModels();
  const client = createReadClient(config.repositoryName);
  const migration = createMigration();
  const dryRun = Boolean(options["dry-run"]);
  const actions = [];

  for (const documentEntry of payload.documents ?? []) {
    const customTypeModel = customTypeModels[documentEntry.type];
    if (!customTypeModel) {
      throw new Error(`Missing custom type model for ${documentEntry.type}`);
    }

    const sourceDocument = await fetchDocumentForEntry(
      client,
      customTypeModel,
      documentEntry.type,
      documentEntry.uid,
      documentEntry.sourceLang,
    );
    const targetDocument = await fetchDocumentForEntry(
      client,
      customTypeModel,
      documentEntry.type,
      documentEntry.uid,
      documentEntry.targetLang,
      { allowMissing: true },
    );

    const baseDocument = targetDocument
      ? createExistingLocalizedDocument(targetDocument)
      : createPendingLocalizedDocument(sourceDocument, documentEntry.targetLang);

    for (const unit of documentEntry.units ?? []) {
      setValueAtPath(baseDocument, unit.path, structuredClone(unit.target));
    }

    const editorTitle =
      getDocumentDisplayTitle({ ...baseDocument, uid: baseDocument.uid ?? documentEntry.uid }) ||
      documentEntry.title ||
      `${documentEntry.type}${documentEntry.uid ? `:${documentEntry.uid}` : ""}`;

    const action = {
      key: documentEntry.key,
      mode: targetDocument ? "update" : "create",
      editorTitle,
    };
    actions.push(action);

    if (dryRun) {
      continue;
    }

    if (targetDocument) {
      migration.updateDocument(baseDocument, editorTitle);
    } else {
      migration.createDocument(baseDocument, editorTitle, {
        masterLanguageDocument: sourceDocument,
      });
    }
  }

  console.log(
    `Prepared ${actions.length} document actions (${actions.filter((item) => item.mode === "create").length} create, ${actions.filter((item) => item.mode === "update").length} update).`,
  );

  const localWrites = [];
  for (const resource of payload.localResources ?? []) {
    const targetFilePath = path.resolve(projectRoot, resource.targetFile);
    const targetData = JSON.parse(await fs.readFile(targetFilePath, "utf8"));

    for (const unit of resource.units ?? []) {
      setValueAtPath(targetData, unit.path, structuredClone(unit.target));
    }

    localWrites.push({ targetFilePath, targetData, key: resource.key });
  }

  if (localWrites.length > 0) {
    console.log(`Prepared ${localWrites.length} local UI resource updates.`);
  }

  if (dryRun) {
    for (const action of actions) {
      console.log(`[dry-run] ${action.mode} ${action.key} -> ${action.editorTitle}`);
    }
    for (const write of localWrites) {
      console.log(`[dry-run] update local ${write.key} -> ${write.targetFilePath}`);
    }
    return;
  }

  const writeToken = process.env.PRISMIC_WRITE_TOKEN;
  if (!writeToken) {
    throw new Error("PRISMIC_WRITE_TOKEN is required for import.");
  }

  const writeClient = createWriteClient(config.repositoryName, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    writeToken,
  });

  await writeClient.migrate(migration, {
    reporter(event) {
      if (event.type === "documents:creating") {
        console.log(
          `[create ${event.data.current}/${event.data.total}] ${event.data.document.title || "Untitled"}`,
        );
      }

      if (event.type === "documents:updating") {
        console.log(
          `[update ${event.data.current}/${event.data.total}] ${event.data.document.title || "Untitled"}`,
        );
      }
    },
  });

  for (const write of localWrites) {
    await fs.writeFile(
      write.targetFilePath,
      JSON.stringify(write.targetData, null, 2) + "\n",
      "utf8",
    );
  }

  console.log("Import completed. Review the migration release in Prismic, then publish it.");
}

async function loadPrismicConfig() {
  const slicemachinePath = path.join(projectRoot, "slicemachine.config.json");
  const slicemachine = JSON.parse(await fs.readFile(slicemachinePath, "utf8"));

  return {
    repositoryName:
      process.env.PRISMIC_REPOSITORY ||
      process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT ||
      slicemachine.repositoryName,
  };
}

function createReadClient(repositoryName) {
  const clientConfig = {};

  if (process.env.PRISMIC_ACCESS_TOKEN) {
    clientConfig.accessToken = process.env.PRISMIC_ACCESS_TOKEN;
  }

  return createClient(repositoryName, clientConfig);
}

async function loadCustomTypeModels() {
  const customTypesDir = path.join(projectRoot, "customtypes");
  const entries = await fs.readdir(customTypesDir, { withFileTypes: true });
  const models = {};

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const filePath = path.join(customTypesDir, entry.name, "index.json");
    const model = JSON.parse(await fs.readFile(filePath, "utf8"));
    models[model.id] = model;
  }

  return models;
}

async function loadSliceModels() {
  const slicesDir = path.join(projectRoot, "src", "slices");
  const entries = await fs.readdir(slicesDir, { withFileTypes: true });
  const models = {};

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const filePath = path.join(slicesDir, entry.name, "model.json");
    try {
      const model = JSON.parse(await fs.readFile(filePath, "utf8"));
      models[model.id] = model;
    } catch {
      continue;
    }
  }

  return models;
}

async function fetchSourceDocuments(client, customTypeModels, sourceLang) {
  const documents = [];

  for (const model of Object.values(customTypeModels)) {
    if (model.repeatable) {
      const results = await client.getAllByType(model.id, { lang: sourceLang });
      documents.push(...results);
      continue;
    }

    const singleton = await client.getSingle(model.id, { lang: sourceLang }).catch(() => null);
    if (singleton) {
      documents.push(singleton);
    }
  }

  documents.sort((left, right) =>
    getDocumentKey(left).localeCompare(getDocumentKey(right), "en"),
  );

  return documents;
}

async function fetchLocalizedCounterpart(client, customTypeModel, sourceDocument, targetLang) {
  if (customTypeModel.repeatable) {
    if (!sourceDocument.uid) {
      return null;
    }

    return client
      .getByUID(sourceDocument.type, sourceDocument.uid, { lang: targetLang })
      .catch(() => null);
  }

  return client.getSingle(sourceDocument.type, { lang: targetLang }).catch(() => null);
}

async function fetchDocumentForEntry(
  client,
  customTypeModel,
  type,
  uid,
  lang,
  options = {},
) {
  if (customTypeModel.repeatable) {
    if (!uid) {
      throw new Error(`Document type "${type}" requires a UID.`);
    }

    const document = await client.getByUID(type, uid, { lang }).catch(() => null);
    if (!document && !options.allowMissing) {
      throw new Error(`Could not find ${type}:${uid} in ${lang}.`);
    }

    return document;
  }

  const document = await client.getSingle(type, { lang }).catch(() => null);
  if (!document && !options.allowMissing) {
    throw new Error(`Could not find singleton ${type} in ${lang}.`);
  }

  return document;
}

function createPendingLocalizedDocument(sourceDocument, targetLang) {
  const pendingDocument = {
    type: sourceDocument.type,
    lang: targetLang,
    tags: structuredClone(sourceDocument.tags ?? []),
    data: structuredClone(sourceDocument.data),
  };

  if (sourceDocument.uid) {
    pendingDocument.uid = sourceDocument.uid;
  }

  return pendingDocument;
}

function createExistingLocalizedDocument(targetDocument) {
  return structuredClone(targetDocument);
}

function extractTranslationUnits({ document, customTypeModel, sliceModels }) {
  const units = [];
  const tabs = customTypeModel.json || {};

  for (const tabFields of Object.values(tabs)) {
    for (const [fieldId, fieldModel] of Object.entries(tabFields)) {
      const value = document.data?.[fieldId];
      extractFieldUnits({
        fieldId,
        fieldModel,
        value,
        pathTokens: [{ type: "field", value: "data" }, { type: "field", value: fieldId }],
        units,
        sliceModels,
      });
    }
  }

  return units;
}

function extractFieldUnits({
  fieldId,
  fieldModel,
  value,
  pathTokens,
  units,
  sliceModels,
}) {
  if (!fieldModel) {
    return;
  }

  if (fieldModel.type === "Text" || fieldModel.type === "Title") {
    if (!shouldTranslateTextField(fieldId, fieldModel) || typeof value !== "string" || !value) {
      return;
    }

    units.push(buildUnit(pathTokens, fieldModel.type, value));
    return;
  }

  if (fieldModel.type === "StructuredText") {
    if (!Array.isArray(value) || value.length === 0) {
      return;
    }

    units.push(buildUnit(pathTokens, "StructuredText", value));
    return;
  }

  if (fieldModel.type === "Image") {
    if (value?.alt) {
      units.push(
        buildUnit(
          [...pathTokens, { type: "field", value: "alt" }],
          "ImageAlt",
          value.alt,
        ),
      );
    }
    return;
  }

  if (fieldModel.type === "Link") {
    if (typeof value?.text === "string" && value.text) {
      units.push(
        buildUnit(
          [...pathTokens, { type: "field", value: "text" }],
          "LinkText",
          value.text,
        ),
      );
    }
    return;
  }

  if (fieldModel.type === "Group") {
    if (!Array.isArray(value) || value.length === 0) {
      return;
    }

    const nestedFields = fieldModel.config?.fields || {};
    value.forEach((item, index) => {
      for (const [nestedFieldId, nestedFieldModel] of Object.entries(nestedFields)) {
        extractFieldUnits({
          fieldId: nestedFieldId,
          fieldModel: nestedFieldModel,
          value: item?.[nestedFieldId],
          pathTokens: [
            ...pathTokens,
            { type: "index", value: index },
            { type: "field", value: nestedFieldId },
          ],
          units,
          sliceModels,
        });
      }
    });
    return;
  }

  if (fieldModel.type === "Slices") {
    if (!Array.isArray(value) || value.length === 0) {
      return;
    }

    value.forEach((slice, index) => {
      const sliceModel = sliceModels[slice.slice_type];
      const variation =
        sliceModel?.variations?.find((item) => item.id === slice.variation) ||
        sliceModel?.variations?.[0];
      const sliceToken = {
        type: "slice",
        id: slice.id || "",
        index,
      };

      for (const [primaryFieldId, primaryFieldModel] of Object.entries(
        variation?.primary || {},
      )) {
        extractFieldUnits({
          fieldId: primaryFieldId,
          fieldModel: primaryFieldModel,
          value: slice.primary?.[primaryFieldId],
          pathTokens: [
            ...pathTokens,
            sliceToken,
            { type: "field", value: "primary" },
            { type: "field", value: primaryFieldId },
          ],
          units,
          sliceModels,
        });
      }

      if (Array.isArray(slice.items)) {
        slice.items.forEach((item, itemIndex) => {
          for (const [itemFieldId, itemFieldModel] of Object.entries(variation?.items || {})) {
            extractFieldUnits({
              fieldId: itemFieldId,
              fieldModel: itemFieldModel,
              value: item?.[itemFieldId],
              pathTokens: [
                ...pathTokens,
                sliceToken,
                { type: "field", value: "items" },
                { type: "index", value: itemIndex },
                { type: "field", value: itemFieldId },
              ],
              units,
              sliceModels,
            });
          }
        });
      }
    });
  }
}

function buildUnit(pathTokens, fieldType, value) {
  const source = structuredClone(value);

  return {
    path: serializePath(pathTokens),
    fieldType,
    source,
    target: structuredClone(source),
    sourceText: summarizeValue(fieldType, source),
  };
}

function shouldTranslateTextField(fieldId, fieldModel) {
  const label = `${fieldId} ${fieldModel?.config?.label || ""} ${
    fieldModel?.config?.placeholder || ""
  }`;

  return !NON_TRANSLATABLE_TEXT_FIELD_PATTERN.test(label);
}

function summarizeValue(fieldType, value) {
  if (fieldType === "StructuredText") {
    return asText(value).trim();
  }

  return typeof value === "string" ? value.trim() : "";
}

function serializePath(tokens) {
  return tokens
    .map((token, index) => {
      if (token.type === "field") {
        return index === 0 ? token.value : `.${token.value}`;
      }

      if (token.type === "index") {
        return `[${token.value}]`;
      }

      if (token.type === "slice") {
        const encodedId = encodeURIComponent(token.id || "");
        return `[slice:${encodedId}:${token.index}]`;
      }

      throw new Error(`Unsupported path token: ${JSON.stringify(token)}`);
    })
    .join("");
}

function parsePath(pathValue) {
  const tokens = [];
  const pattern = /([A-Za-z0-9_]+)|\[(slice:([^:\]]*):(\d+)|(\d+))\]/g;
  let match;

  while ((match = pattern.exec(pathValue))) {
    if (match[1]) {
      tokens.push({ type: "field", value: match[1] });
      continue;
    }

    if (match[3] !== undefined) {
      tokens.push({
        type: "slice",
        id: decodeURIComponent(match[3]),
        index: Number.parseInt(match[4], 10),
      });
      continue;
    }

    tokens.push({ type: "index", value: Number.parseInt(match[5], 10) });
  }

  return tokens;
}

function setValueAtPath(document, pathValue, nextValue) {
  const tokens = parsePath(pathValue);
  let current = document;

  for (let index = 0; index < tokens.length - 1; index += 1) {
    const token = tokens[index];
    const nextToken = tokens[index + 1];

    if (token.type === "field") {
      if (current[token.value] === undefined) {
        current[token.value] = nextToken?.type === "index" ? [] : {};
      }
      current = current[token.value];
      continue;
    }

    if (token.type === "index") {
      if (!Array.isArray(current)) {
        throw new Error(`Expected array while resolving ${pathValue}`);
      }

      if (current[token.value] === undefined) {
        current[token.value] = nextToken?.type === "index" ? [] : {};
      }
      current = current[token.value];
      continue;
    }

    if (token.type === "slice") {
      if (!Array.isArray(current)) {
        throw new Error(`Expected slices array while resolving ${pathValue}`);
      }

      current =
        current.find((item) => item?.id === token.id) ??
        current[token.index];

      if (!current) {
        throw new Error(`Could not resolve slice token in ${pathValue}`);
      }
    }
  }

  const lastToken = tokens[tokens.length - 1];
  if (!lastToken) {
    throw new Error(`Empty path: ${pathValue}`);
  }

  if (lastToken.type === "field") {
    current[lastToken.value] = nextValue;
    return;
  }

  if (lastToken.type === "index") {
    current[lastToken.value] = nextValue;
    return;
  }

  throw new Error(`Cannot assign directly to slice token in ${pathValue}`);
}

function getDocumentKey(document) {
  return `${document.type}:${document.uid ?? "__singleton__"}`;
}

function getDocumentDisplayTitle(document) {
  if (!document?.data || typeof document.data !== "object") {
    return document?.uid || document?.type || "Untitled";
  }

  const candidates = [
    document.data.meta_title,
    document.data.title,
    document.data.name,
    document.data.site_title,
    document.data.hero_kicker,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }

    if (Array.isArray(candidate)) {
      const text = asText(candidate).trim();
      if (text) {
        return text;
      }
    }
  }

  return document.uid || document.type || "Untitled";
}

function defaultExportPath(sourceLang, targetLang) {
  return path.join(
    "translations",
    `prismic-${sourceLang.replace(/[^a-z0-9]+/gi, "-")}-to-${targetLang.replace(/[^a-z0-9]+/gi, "-")}.json`,
  );
}

function normalizeLocale(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return LOCALE_ALIASES[normalized] || null;
}

function parseCsv(value) {
  if (!value || typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function exportLocalResources(sourceLang, targetLang) {
  const sourceFilePath = UI_COPY_FILE_BY_LANG[sourceLang];
  const targetFilePath = UI_COPY_FILE_BY_LANG[targetLang];

  if (!sourceFilePath || !targetFilePath) {
    return [];
  }

  const sourceData = JSON.parse(await fs.readFile(sourceFilePath, "utf8"));
  const targetData = JSON.parse(await fs.readFile(targetFilePath, "utf8"));
  const units = [];

  extractLocalValueUnits(sourceData, targetData, [], units);

  return [
    {
      key: "ui-copy",
      sourceLang,
      targetLang,
      sourceFile: path.relative(projectRoot, sourceFilePath),
      targetFile: path.relative(projectRoot, targetFilePath),
      units,
    },
  ];
}

function extractLocalValueUnits(sourceValue, targetValue, pathTokens, units) {
  if (typeof sourceValue === "string") {
    units.push({
      path: serializePath(pathTokens),
      fieldType: "LocalString",
      source: sourceValue,
      target: typeof targetValue === "string" ? targetValue : sourceValue,
      sourceText: sourceValue.trim(),
    });
    return;
  }

  if (Array.isArray(sourceValue)) {
    sourceValue.forEach((item, index) => {
      extractLocalValueUnits(
        item,
        Array.isArray(targetValue) ? targetValue[index] : undefined,
        [...pathTokens, { type: "index", value: index }],
        units,
      );
    });
    return;
  }

  if (!sourceValue || typeof sourceValue !== "object") {
    return;
  }

  for (const [key, value] of Object.entries(sourceValue)) {
    extractLocalValueUnits(
      value,
      targetValue && typeof targetValue === "object" ? targetValue[key] : undefined,
      [...pathTokens, { type: "field", value: key }],
      units,
    );
  }
}

function buildMarkdownSummary(payload) {
  const lines = [
    "# Prismic translation review",
    "",
    `- Repository: ${payload.repositoryName}`,
    `- Source locale: ${payload.sourceLang}`,
    `- Target locale: ${payload.targetLang}`,
    `- Exported at: ${payload.exportedAt}`,
    `- Documents: ${payload.documentCount}`,
    `- Local resources: ${payload.localResourceCount || 0}`,
    "",
  ];

  for (const documentEntry of payload.documents ?? []) {
    lines.push(`## ${documentEntry.key}`);
    lines.push("");
    lines.push(`- Title: ${documentEntry.title || "Untitled"}`);
    lines.push(`- Target exists: ${documentEntry.targetExists ? "yes" : "no"}`);
    lines.push("");

    for (const unit of documentEntry.units ?? []) {
      lines.push(`### ${unit.path}`);
      lines.push("");
      lines.push(`- Type: ${unit.fieldType}`);
      lines.push(`- Source: ${unit.sourceText || "(empty)"}`);
      lines.push("");
    }
  }

  for (const resource of payload.localResources ?? []) {
    lines.push(`## ${resource.key}`);
    lines.push("");
    lines.push(`- Source file: ${resource.sourceFile}`);
    lines.push(`- Target file: ${resource.targetFile}`);
    lines.push("");

    for (const unit of resource.units ?? []) {
      lines.push(`### ${unit.path}`);
      lines.push("");
      lines.push(`- Type: ${unit.fieldType}`);
      lines.push(`- Source: ${unit.sourceText || "(empty)"}`);
      lines.push("");
    }
  }

  lines.push("");
  return lines.join("\n");
}

await main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
