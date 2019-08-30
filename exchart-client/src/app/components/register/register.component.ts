import { Component } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { Router } from '@angular/router'

import { AuthService } from '../../services/auth.service'
import { UserService } from '../../services/user.service'

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
    RegisterFormData = {
        Submitting: false,
        Error: false,
        Email: new FormControl('', [
            Validators.required,
            Validators.email,
        ]),
        Password: new FormControl('', [
            Validators.required,
        ]),
        Name: new FormControl('', [
            Validators.required,
        ]),
    }

    constructor(
        private readonly router: Router,
        private readonly auth: AuthService,
        private readonly userService: UserService,
    ) {}

    async Register(): Promise<void> {
        if (this.RegisterFormData.Email.hasError('required') || this.RegisterFormData.Email.hasError('email')) {
            return
        }

        if (this.RegisterFormData.Password.hasError('required')) {
            return
        }

        if (this.RegisterFormData.Name.hasError('required')) {
            return
        }

        try {
            const email = this.RegisterFormData.Email.value as string
            const password = this.RegisterFormData.Password.value as string
            const name = this.RegisterFormData.Name.value as string

            this.RegisterFormData.Submitting = true
            await this.userService.Register(email, password, name)
            await this.auth.Authenticate(email, password)
            this.RegisterFormData.Submitting = false
            await this.router.navigate(['/'])
        } catch (error) {
            this.RegisterFormData.Submitting = false
            this.RegisterFormData.Error = true
        }
    }
}
