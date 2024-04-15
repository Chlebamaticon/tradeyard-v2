import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class BaseApiService {
  #baseUrl = 'http://localhost:3000/api';

  constructor(readonly http: HttpClient) {}

  get<T = unknown>(
    urlOrPath: string,
    options: Parameters<typeof this.http.get>[1]
  ) {
    return this.http.get<T>(this.#resolveUrlOrPath(urlOrPath), options);
  }

  post<T = unknown>(
    urlOrPath: string,
    body: unknown,
    options: Parameters<typeof this.http.post>[2]
  ) {
    return this.http.post<T>(this.#resolveUrlOrPath(urlOrPath), body, options);
  }

  put<T = unknown>(
    urlOrPath: string,
    body: unknown,
    options: Parameters<typeof this.http.put>[2]
  ) {
    return this.http.put<T>(this.#resolveUrlOrPath(urlOrPath), body, options);
  }

  delete<T = unknown>(
    urlOrPath: string,
    options: Parameters<typeof this.http.delete>[1]
  ) {
    return this.http.delete<T>(this.#resolveUrlOrPath(urlOrPath), options);
  }

  patch<T = unknown>(
    urlOrPath: string,
    body: unknown,
    options: Parameters<typeof this.http.patch>[2]
  ) {
    return this.http.patch<T>(this.#resolveUrlOrPath(urlOrPath), body, options);
  }

  head<T = unknown>(
    urlOrPath: string,
    options: Parameters<typeof this.http.head>[1]
  ) {
    return this.http.head<T>(this.#resolveUrlOrPath(urlOrPath), options);
  }

  jsonp<T = unknown>(
    urlOrPath: string,
    callbackParam: string
  ): ReturnType<typeof this.http.jsonp> {
    return this.http.jsonp<T>(this.#resolveUrlOrPath(urlOrPath), callbackParam);
  }

  request(
    method: string,
    urlOrPath: string,
    options: Parameters<typeof this.http.request>[2]
  ) {
    return this.http.request(
      method,
      this.#resolveUrlOrPath(urlOrPath),
      options
    );
  }

  #resolveUrlOrPath(urlOrPath: string): string {
    if (urlOrPath.startsWith('http')) {
      return urlOrPath;
    }

    const baseUrl = this.#baseUrl.endsWith('/')
      ? this.#baseUrl
      : `${this.#baseUrl}/`;
    const path = urlOrPath.startsWith('/') ? urlOrPath.slice(1) : urlOrPath;
    return `${baseUrl}${path}`;
  }
}
