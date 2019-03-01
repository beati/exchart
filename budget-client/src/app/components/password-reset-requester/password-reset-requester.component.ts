import { Component } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'

import { UserService } from '../../services/user.service'

@Component({
  selector: 'app-password-reset-requester',
  templateUrl: './password-reset-requester.component.html',
  styleUrls: ['./password-reset-requester.component.scss'],
})
export class PasswordResetRequesterComponent {
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

    async RequestPasswordReset(): Promise<void> {
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
