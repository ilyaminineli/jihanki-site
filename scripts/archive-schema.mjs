/* M37 — Runtime archive record contracts.
   Deliberately validates structure and field types, not editorial completeness. */

const STOCK_STATES = new Set([
  "new", "available", "low-stock", "sold-out", "restocking", "archived", "withdrawn"
]);

const REQUIRED_BY_TYPE = {
  video: ["file"],
  image: ["file"],
  voicebank: ["image"],
  project: ["file"],
  audio: ["file"],
  text: ["file"]
};

const OPTIONAL_STRINGS = [
  "author", "description", "group", "project", "subtitle", "context", "date",
  "file", "image", "projectPath", "url"
];

function validArchiveDate(value) {
  if (typeof value !== "string") return false;
  if (/^\d{4}$/.test(value)) return true;
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]), month = Number(match[2]), day = match[3] ? Number(match[3]) : null;
  if (month < 1 || month > 12) return false;
  if (day === null) return true;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function validateRecordSchema(record) {
  const errors = [];
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return ["record must be an object"];
  }

  const type = String(record.type || "").toLowerCase();
  const required = REQUIRED_BY_TYPE[type];
  if (!required) errors.push("unsupported record type: " + (type || "(empty)"));

  required?.forEach(field => {
    if (typeof record[field] !== "string" || !record[field].trim()) {
      errors.push(type + " records require a non-empty " + field + " field");
    }
  });

  OPTIONAL_STRINGS.forEach(field => {
    if (record[field] !== undefined && record[field] !== null && typeof record[field] !== "string") {
      errors.push(field + " must be a string when provided");
    }
  });

  if (record.date !== undefined && record.date !== null && record.date !== "" && !validArchiveDate(record.date)) {
    errors.push("date must use YYYY, YYYY-MM or a real YYYY-MM-DD date");
  }

  if (record.url) {
    try {
      const url = new URL(record.url);
      if (!["http:", "https:"].includes(url.protocol)) errors.push("url must use HTTP or HTTPS");
    } catch (_) {
      errors.push("url must be a valid HTTP or HTTPS URL");
    }
  }

  if (record.voices !== undefined && (!Array.isArray(record.voices) ||
      record.voices.some(voice => typeof voice !== "string" || !voice.trim()))) {
    errors.push("voices must be an array of non-empty strings");
  }

  if (record.stock !== undefined && record.stock !== null) {
    if (typeof record.stock !== "object" || Array.isArray(record.stock)) {
      errors.push("stock must be an object when provided");
    } else {
      if (record.stock.status !== undefined &&
          !STOCK_STATES.has(String(record.stock.status).toLowerCase())) {
        errors.push("invalid stock status: " + record.stock.status);
      }
      const quantity = record.stock.quantity;
      if (quantity !== undefined && quantity !== null &&
          (!Number.isFinite(quantity) || quantity < 0)) {
        errors.push("stock.quantity must be a non-negative number or null");
      }
      for (const field of ["label", "note"]) {
        if (record.stock[field] !== undefined && typeof record.stock[field] !== "string") {
          errors.push("stock." + field + " must be a string when provided");
        }
      }
    }
  }

  if (record.metadata !== undefined && record.metadata !== null) {
    if (typeof record.metadata !== "object" || Array.isArray(record.metadata)) {
      errors.push("metadata must be an object when provided");
    } else {
      for (const field of ["locations", "related"]) {
        if (record.metadata[field] !== undefined &&
            (!Array.isArray(record.metadata[field]) ||
             record.metadata[field].some(value => typeof value !== "string" || !value.trim()))) {
          errors.push("metadata." + field + " must be an array of non-empty strings when provided");
        }
      }
    }
  }

  if (record.category === "performance" && type !== "video") {
    errors.push("performance category records must use type video");
  }

  return errors;
}
