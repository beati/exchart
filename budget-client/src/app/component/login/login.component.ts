import { HttpErrorResponse } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'

import { StatusCode } from '../../services/http-status-codes'

import { AuthService } from '../../services/auth.service'

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    LoginFormData = {
        Submitting: false,
        Error: '',
        Email: '',
        Password: '',
    }

    constructor(
        private readonly router: Router,
        private readonly auth: AuthService,
    ) {}

    async ngOnInit(): Promise<void> {
        if (this.auth.LoggedIn()) {
            await this.router.navigate(['/'])
        }
    }

    async Login(): Promise<void> {
        try {
            this.LoginFormData.Submitting = true
            await this.auth.Authenticate(this.LoginFormData.Email, this.LoginFormData.Password)
            this.LoginFormData.Submitting = false
            await this.router.navigate(['/'])
        } catch (error) {
            this.LoginFormData.Submitting = false
            if (error instanceof HttpErrorResponse) {
                if (error.status === StatusCode.Unauthorized) {
                    this.LoginFormData.Error = 'bad_credentials'
                    return
                }
            }
            this.LoginFormData.Error = 'error'
        }
    }
}
