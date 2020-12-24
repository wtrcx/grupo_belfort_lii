export interface ReturnScript {
  status?: boolean;
  error?: boolean;
  message: string | string[];
  data?: any;
  start?: boolean;
  finish?: boolean;
  end?: boolean;
}
