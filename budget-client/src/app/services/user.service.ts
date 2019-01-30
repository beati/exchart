import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

import { HttpClientWrapper } from './http-client-wrapper'

import { AuthService } from './auth.service'

@Injectable({
    providedIn: 'root',
})
export class UserService {
    http: HttpClientWrapper

    constructor(
        httpClient: HttpClient,
        auth: AuthService,
    ) {
        this.http = new HttpClientWrapper(httpClient, auth)
    }

    async Register(email: string, password: string, name: string): Promise<void> {
        await this.http.post<void>('/api/user', {
            Email: email,
            Password: password,
            Name: name,
        })
    }

    async ChangeEmail(password: string, email: string): Promise<void> {
        await this.http.post<void>('/api/user/email', {
            Password: password,
            Email: email,
        })
    }

    async ChangePassword(oldPassword: string, newPassword: string): Promise<void> {
        await this.http.post<void>('/api/user/password', {
            OldPassword: oldPassword,
            NewPassword: newPassword,
        })
    }

    async VerifyEmail(id: string, email: string, token: string, action: string): Promise<void> {
        await this.http.post<void>('/api/user/email/verify', {
            Action: action,
            ID: id,
            Email: email,
            Token: token,
        })
    }

    async RequestPasswordReset(email: string): Promise<void> {
        await this.http.post<void>('/api/user/password/request_reset', {
            Email: email,
        })
    }

    async ResetPassword(id: string, token: string, password: string, name?: string): Promise<void> {
        await this.http.post<void>('/api/user/password/reset', {
            ID: id,
            Token: token,
            Password: password,
            Name: name,
        })
    }
}
