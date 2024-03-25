import { Query, ResponseError } from 'src/types';
import { User } from './entities/user.entities';
import { OrderUserProperty } from './enum/orderProperty';

export interface DataUser {
  uid: string;
  ci: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  status: boolean;
  uidRol: string;
}

export type DataUserOfExtraData = Omit<DataUser, 'status'>;
export type DataUserGetAll = Omit<DataUser, 'status' | 'password'>;
export type DataUserUpdate = Omit<DataUser, 'password'>;
export type DataUserUpdateProfile = Omit<
  DataUser,
  'password' | 'email' | 'uid' | 'status'
>;
export type DataUserUpdateProfileEmail = Pick<DataUser, 'password' | 'email'>;
export type DataUserLogin = Pick<DataUser, 'ci' | 'password'>;
export type DataUserUID = Pick<DataUser, 'uid'>;

export interface Msg {
  findOne: string;
  register: string;
  validation: {
    disability: string;
    default: string;
  };
  login: {
    status: string;
    error: string;
  };
  update: string;
  profile: {
    data: string;
    email: string;
    password: string;
    passwordError: string;
    error: string;
  };
  unregister: string;
}

export type ReturnLoginUser = Promise<{ jwt: string } | ResponseError>;
export type ResUser = Promise<User | ResponseError>;
export interface ValidateUser<T> {
  models: { isUserByUid?: T; isUserByCI?: T; isUserByEmail?: T };
  msg: Msg;
}

export interface UserJWT {
  user: { uid: string };
}

export interface GetUsers extends Query {
  orderProperty?: OrderUserProperty;
  uid?: string;
  search?: string;
}

export interface Filter<T> {
  filter: T;
  uid: string;
}

export interface PayloadJWT {
  uid: string;
  uidRol: string;
}
