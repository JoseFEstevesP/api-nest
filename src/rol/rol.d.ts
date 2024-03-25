import { Query } from 'src/types';
import { OrderRolProperty } from './enum/orderProperty';
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
  orderProperty?: OrderRolProperty;
  search?: string;
  permission?: Permission;
}
