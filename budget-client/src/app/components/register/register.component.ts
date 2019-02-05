import { Component } from '@angular/core'
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
        Email: '',
        Password: '',
        Name: '',
    }

    constructor(
        private readonly router: Router,
        private readonly auth: AuthService,
        private readonly userService: UserService,
    ) {}

    async Register(): Promise<void> {
        try {
            this.RegisterFormData.Submitting = true
            await this.userService.Register(
                this.RegisterFormData.Email,
                this.RegisterFormData.Password,
                this.RegisterFormData.Name,
            )
            await this.auth.Authenticate(
                this.RegisterFormData.Email,
                this.RegisterFormData.Password,
            )
            this.RegisterFormData.Submitting = false
            await this.router.navigate(['/'])
        } catch (error) {
            this.RegisterFormData.Submitting = false
            this.RegisterFormData.Error = true
        }
    }
}
