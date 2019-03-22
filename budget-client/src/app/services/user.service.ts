import { Injectable } from '@angular/core'

import { HttpWrapperService } from './http-wrapper.service'

@Injectable({
    providedIn: 'root',
})
export class UserService {
    constructor(
        private readonly http: HttpWrapperService,
    ) {}

    async Register(email: string, password: string, name: string): Promise<void> {
        return this.http.post<void>('/api/user', {
            Email: email,
            Password: password,
            Name: name,
        })
    }

    async ChangeEmail(password: string, email: string): Promise<void> {
        return this.http.post<void>('/api/user/email', {
            Password: password,
            Email: email,
        })
    }

    async ChangePassword(currentPassword: string, newPassword: string): Promise<void> {
        return this.http.post<void>('/api/user/password', {
            CurrentPassword: currentPassword,
            NewPassword: newPassword,
        })
    }

    async VerifyEmail(id: string, token: string, action: string): Promise<void> {
        return this.http.post<void>('/api/user/email/verify', {
            Action: action,
            ID: id,
            Token: token,
        })
    }

    async RequestPasswordReset(email: string): Promise<void> {
        return this.http.post<void>('/api/user/password/request_reset', {
            Email: email,
        })
    }

    async ResetPassword(id: string, token: string, password: string): Promise<void> {
        return this.http.post<void>('/api/user/password/reset', {
            ID: id,
            Token: token,
            Password: password,
        })
    }
}
