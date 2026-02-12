export type UINode = {
  type: string;
  props?: Record<string, any>;
  children?: UINode[];
};
