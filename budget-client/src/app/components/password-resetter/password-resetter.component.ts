import { Component } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'

import { UserService } from '../../services/user.service'

@Component({
    selector: 'app-password-resetter',
    templateUrl: './password-resetter.component.html',
    styleUrls: ['./password-resetter.component.scss'],
})
export class PasswordResetterComponent {
    Done = false
    Submitting = false
    Error = false
    Email = new FormControl('', [
        Validators.required,
        Validators.email,
    ])

    constructor(
        private readonly userService: UserService,
    ) {}

    async ResetPassword(): Promise<void> {
        if (this.Email.hasError('required') || this.Email.hasError('email')) {
            return
        }

        try {
            const email: string = this.Email.value

            this.Submitting = true
            await this.userService.RequestPasswordReset(email)
            this.Submitting = false
            this.Done = true
        } catch (error) {
            this.Submitting = false
            this.Error = true
        }
    }
}
