import { Query, ResponseError } from 'src/types';
import { Permission } from './enum/permissions';

export interface DataRol {
  uid: string;
  name: string;
  permissions: string;
  status: boolean;
}

export type DataRolOfStatus = Omit<DataRol, 'status'>;

export interface ValidateRol<T> {
  models: { isRolByUid?: T; isRolByName?: T };
  msg: Msg;
}
export interface Msg {
  findOne: string;
  register: string;
  validation: {
    disability: string;
    default: string;
  };
  update: string;
  delete: string;
}

export interface GetRol extends Query {
  orderProperty?: OrderUserProperty;
  search?: string;
  permission?: Permission;
}

export type ResListRol = Promise<
  | {
      rows: Array<DataRolOfStatus>;
      count: number;
      currentPage: number;
      nextPage: number | null;
      previousPage: number | null;
      limit: number;
      pages: number;
    }
  | ResponseError
>;
