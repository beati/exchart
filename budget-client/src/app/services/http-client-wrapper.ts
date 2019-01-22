import { HttpClient } from '@angular/common/http'

import { AuthService } from './auth.service'

export class HttpClientWrapper {
    constructor(private http: HttpClient, private auth: AuthService) {}

    async get<T>(url: string): Promise<T> {
        try {
            return await this.http.get<T>(url).toPromise()
        } catch (error) {
            //this.auth.CatchUnauthentication(error)
            throw error
        }
    }

    async post<T>(url: string, body: any): Promise<T> {
        try {
            return await this.http.post<T>(url, body).toPromise()
        } catch (error) {
            //this.auth.CatchUnauthentication(error)
            throw error
        }
    }

    async put<T>(url: string, body: any): Promise<T> {
        try {
            return await this.http.put<T>(url, body).toPromise()
        } catch (error) {
            //this.auth.CatchUnauthentication(error)
            throw error
        }
    }

    async delete<T>(url: string): Promise<T> {
        try {
            return await this.http.delete<T>(url).toPromise()
        } catch (error) {
            //this.auth.CatchUnauthentication(error)
            throw error
        }
    }
}
