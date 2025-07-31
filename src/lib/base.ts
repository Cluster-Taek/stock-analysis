import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';

type Body = Record<string, unknown> | Record<string, unknown>[];

interface IFetchApiArgs {
  method: string;
  url: string;
  body?: Body;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _fetchApi = async <T = object>({ method, url, body }: IFetchApiArgs): Promise<T> => {
  const session = await getSession();

  const response = await axios({
    method,
    url: `${process.env.NEXT_PUBLIC_API_URL}${url.replace('/admin-api', '/admin-api/v1')}`,
    data: method !== 'GET' ? body : undefined,
    params: method === 'GET' ? body : undefined,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.user?.accessToken}`,
    },
    withCredentials: true,
  }).catch(async (error) => {
    // Case. SSR
    if (typeof window === 'undefined') throw error;

    // Case CSR
    if (error?.status === 401 && !window.location.pathname.startsWith('/login')) {
      if (window.location.pathname.startsWith('/external')) {
        throw error;
      }
      await signOut();
      redirect('/login');
    }

    throw error;
  });

  return response?.data;
};

type FetchApi = {
  post: <T = object>(url: string, body?: Body) => Promise<T>;
  get: <T = object>(url: string, params?: Record<string, unknown>) => Promise<T>;
  patch: <T = object>(url: string, body?: Body) => Promise<T>;
  put: <T = object>(url: string, body?: Body) => Promise<T>;
  delete: <T = object>(url: string) => Promise<T>;
};

export const fetchApi: FetchApi = {
  post: (url, body) =>
    _fetchApi({
      method: 'POST',
      url,
      body,
    }),
  get: (url, params) =>
    _fetchApi({
      method: 'GET',
      url,
      body: params,
    }),
  patch: (url, body) =>
    _fetchApi({
      method: 'PATCH',
      url,
      body,
    }),
  put: (url, body) =>
    _fetchApi({
      method: 'PUT',
      url,
      body,
    }),
  delete: (url) =>
    _fetchApi({
      method: 'DELETE',
      url,
    }),
};
