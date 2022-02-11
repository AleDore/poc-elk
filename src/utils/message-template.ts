export const messageMetadataTemplate = {
  index_patterns: ["messages-metadata"],
  template: {
    settings: {
      index: {
        number_of_replicas: "0",
      },
    },
    mappings: {
      properties: {
        archived: {
          type: "boolean",
        },
        createdAt: {
          type: "date",
        },
        timeToLive: {
          coerce: true,
          index: true,
          ignore_malformed: false,
          store: false,
          type: "long",
          doc_values: true,
        },
        read: {
          type: "boolean",
        },
        senderUserId: {
          type: "keyword",
        },
        fiscalCode: {
          type: "keyword",
        },
        id: {
          type: "keyword",
        },
        senderServiceId: {
          type: "keyword",
        },
        isPending: {
          type: "boolean",
        },
      },
    },
  },
  composed_of: [],
};
