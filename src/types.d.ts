export type ResError = [{ [any]: string }] | any[];

export interface ResponseError {
  errors: ResError;
}

export type PromiseError = Promise<ResponseError>;

export interface Query {
  status?: boolean;
  limit?: string;
  page?: string;
  order?: Order;
}

export type ResData = Promise<{ msg: string } | ResponseError>;

export type ResList<T> = Promise<
  | {
      rows: Array<T>;
      count: number;
      currentPage: number;
      nextPage: number | null;
      previousPage: number | null;
      limit: number;
      pages: number;
    }
  | ResponseError
>;
