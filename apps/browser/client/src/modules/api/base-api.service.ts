import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class BaseApiService {
  #baseUrl = 'http://localhost:3000/api';

  constructor(readonly http: HttpClient) {}

  get(urlOrPath: string, options: Parameters<typeof this.http.get>[1]) {
    return this.http.get(this.#resolveUrlOrPath(urlOrPath), options);
  }

  post(
    urlOrPath: string,
    body: unknown,
    options: Parameters<typeof this.http.post>[2]
  ) {
    return this.http.post(this.#resolveUrlOrPath(urlOrPath), body, options);
  }

  put(
    urlOrPath: string,
    body: unknown,
    options: Parameters<typeof this.http.put>[2]
  ) {
    return this.http.put(this.#resolveUrlOrPath(urlOrPath), body, options);
  }

  delete(urlOrPath: string, options: Parameters<typeof this.http.delete>[1]) {
    return this.http.delete(this.#resolveUrlOrPath(urlOrPath), options);
  }

  patch(
    urlOrPath: string,
    body: unknown,
    options: Parameters<typeof this.http.patch>[2]
  ) {
    return this.http.patch(this.#resolveUrlOrPath(urlOrPath), body, options);
  }

  head(urlOrPath: string, options: Parameters<typeof this.http.head>[1]) {
    return this.http.head(this.#resolveUrlOrPath(urlOrPath), options);
  }

  jsonp(
    urlOrPath: string,
    callbackParam: string
  ): ReturnType<typeof this.http.jsonp> {
    return this.http.jsonp(this.#resolveUrlOrPath(urlOrPath), callbackParam);
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
