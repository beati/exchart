import { Component } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'

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
    Password = new FormControl('', [
        Validators.required,
    ])

    constructor(
        private readonly route: ActivatedRoute,
        private readonly userService: UserService,
    ) {}

    async ResetPassword(): Promise<void> {
        if (this.Password.hasError('required')) {
            return
        }

        try {
            const password = this.Password.value as string
            let id = ''
            let token = ''
            let param = this.route.snapshot.queryParamMap.get('id')
            if (param != undefined) {
                id = param
            }
            param = this.route.snapshot.queryParamMap.get('token')
            if (param != undefined) {
                token = param
            }

            this.Submitting = true
            await this.userService.ResetPassword(id, token, password)
            this.Submitting = false
            this.Done = true
        } catch (error) {
            this.Submitting = false
            this.Error = true
        }
    }
}
