import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'

import { AuthService } from './auth.service'

export enum StatusCode {
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    InternalServerError = 500,
}

@Injectable({
    providedIn: 'root',
})
export class HttpWrapperService {
    constructor(
        private readonly http: HttpClient,
        private readonly auth: AuthService,
    ) {}

    async get<T>(url: string): Promise<T> {
        try {
            return await this.http.get<T>(url).toPromise()
        } catch (error) {
            if (error instanceof HttpErrorResponse) {
                this.auth.CatchUnauthentication(error)
            }
            throw error
        }
    }

    async post<T>(url: string, body: any): Promise<T> {
        try {
            return await this.http.post<T>(url, body).toPromise()
        } catch (error) {
            if (error instanceof HttpErrorResponse) {
                this.auth.CatchUnauthentication(error)
            }
            throw error
        }
    }

    async put<T>(url: string, body: any): Promise<T> {
        try {
            return await this.http.put<T>(url, body).toPromise()
        } catch (error) {
            if (error instanceof HttpErrorResponse) {
                this.auth.CatchUnauthentication(error)
            }
            throw error
        }
    }

    async delete<T>(url: string): Promise<T> {
        try {
            return await this.http.delete<T>(url).toPromise()
        } catch (error) {
            if (error instanceof HttpErrorResponse) {
                this.auth.CatchUnauthentication(error)
            }
            throw error
        }
    }
}
