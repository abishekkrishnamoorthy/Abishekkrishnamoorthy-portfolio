export type MediaAsset = {
  _id: string;
  publicId: string;
  url: string;
  secureUrl: string;
  folder: string;
  resourceType: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  usedIn?: Array<{ collection: string; documentId: string; field: string }>;
  deleteFailed?: boolean;
};
