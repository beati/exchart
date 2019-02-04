import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'

import { Subject } from 'rxjs'

import { StatusCode } from './http-status-codes'

const setLoggedIn = (loggedIn: boolean): void => {
    localStorage.setItem('loggedIn', `${loggedIn}`)
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    UnauthenticationSig = new Subject<void>()

    constructor(
        private readonly http: HttpClient,
    ) {}

    LoggedIn(): boolean {
        return localStorage.getItem('loggedIn') === 'true'
    }

    async Authenticated(): Promise<boolean> {
        try {
            await this.http.get<void>('/api/auth').toPromise()
            setLoggedIn(true)
            return true
        } catch (error) {
            if (error instanceof HttpErrorResponse) {
                if (error.status === StatusCode.Forbidden) {
                    setLoggedIn(false)
                    return false
                }
            }
            throw error
        }
    }

    async Authenticate(email: string, password: string): Promise<void> {
        try {
            await this.http.post<void>('/api/auth', {
                Email: email,
                Password: password,
            }).toPromise()
            setLoggedIn(true)
        } catch (error) {
            if (error instanceof HttpErrorResponse) {
                if (error.status === StatusCode.Unauthorized) {
                    setLoggedIn(false)
                }
            }
            throw error
        }
    }

    async Unauthenticate(): Promise<void> {
        await this.http.delete<void>('/api/auth').toPromise()
        setLoggedIn(false)
        this.UnauthenticationSig.next()
    }

    CatchUnauthentication(error: HttpErrorResponse): void {
        if (error.status === StatusCode.Forbidden) {
            setLoggedIn(false)
            this.UnauthenticationSig.next()
        }
    }
}
