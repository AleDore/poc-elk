import { INDEX_NAME } from "./elastic-config";

export const messageMetadataTemplate = {
  composed_of: [],
  index_patterns: [INDEX_NAME],
  template: {
    mappings: {
      properties: {
        archived: {
          type: "boolean",
        },
        createdAt: {
          type: "date",
        },
        fiscalCode: {
          type: "keyword",
        },
        id: {
          type: "keyword",
        },
        isPending: {
          type: "boolean",
        },
        read: {
          type: "boolean",
        },
        senderServiceId: {
          type: "keyword",
        },
        senderUserId: {
          type: "keyword",
        },
        timeToLive: {
          coerce: true,
          doc_values: true,
          ignore_malformed: false,
          index: true,
          store: false,
          type: "long",
        },
      },
    },
    settings: {
      index: {
        number_of_replicas: "0",
      },
    },
  },
};
