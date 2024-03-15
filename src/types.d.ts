export type ResError = [{ [any]: string }] | any[];

export interface ResponseError {
  errors: ResError;
}

export type PromiseError = Promise<ResponseError>;

export interface Query {
  status?: boolean;
  limit: number;
  page: number;
  order: Order;
}
