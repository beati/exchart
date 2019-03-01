import { HttpErrorResponse } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
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
        Email: new FormControl('', [
            Validators.required,
            Validators.email,
        ]),
        Password: new FormControl('', [
            Validators.required,
        ]),
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
        if (this.LoginFormData.Email.hasError('required') || this.LoginFormData.Email.hasError('email')) {
            return
        }

        if (this.LoginFormData.Password.hasError('required')) {
            return
        }

        try {
            const email: string = this.LoginFormData.Email.value
            const password: string = this.LoginFormData.Password.value

            this.LoginFormData.Submitting = true
            await this.auth.Authenticate(email, password)
            this.LoginFormData.Submitting = false
            await this.router.navigate(['/'])
        } catch (error) {
            this.LoginFormData.Submitting = false
            if (error instanceof HttpErrorResponse) {
                if (error.status === StatusCode.Unauthorized) {
                    this.LoginFormData.Error = 'BadCredentials'
                    return
                }
            }
            this.LoginFormData.Error = 'Default'
        }
    }
}
