import { HttpErrorResponse } from '@angular/common/http'
import { Component } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'

import { TranslateService } from '@ngx-translate/core'

import { MatDialog } from '@angular/material/dialog'

import { StatusCode } from '../../services/http-status-codes'

import { ErrorService } from '../../services/error.service'
import { UserService } from '../../services/user.service'

import { MessageDialogComponent } from '../message-dialog/message-dialog.component'

@Component({
    selector: 'app-password-changer',
    templateUrl: './password-changer.component.html',
    styleUrls: ['./password-changer.component.scss'],
})
export class PasswordChangerComponent {
    Submitting = false
    CurrentPassword = new FormControl('', [
        Validators.required,
    ])
    NewPassword = new FormControl('', [
        Validators.required,
    ])

    constructor(
        private readonly translate: TranslateService,
        private readonly dialog: MatDialog,
        private readonly userService: UserService,
        private readonly errorService: ErrorService,
    ) {}

    async ChangePassword(): Promise<void> {
        this.CurrentPassword.updateValueAndValidity()
        this.NewPassword.updateValueAndValidity()

        if (this.CurrentPassword.hasError('required')) {
            return
        }

        if (this.NewPassword.hasError('required')) {
            return
        }

        try {
            const currentPassword = this.CurrentPassword.value as string
            const newPassword = this.NewPassword.value as string

            this.Submitting = true
            await this.userService.ChangePassword(currentPassword, newPassword)
            this.Submitting = false
            const succesMessage = (await this.translate.get('Settings.ChangePassword.Success').toPromise()) as string
            this.dialog.open(MessageDialogComponent, {
                autoFocus: false,
                data: succesMessage,
            })
            this.CurrentPassword.reset()
            this.CurrentPassword.setErrors(null)
            this.NewPassword.reset()
            this.NewPassword.setErrors(null)
        } catch (error) {
            this.Submitting = false

            let errorReference: string | undefined
            if (error instanceof HttpErrorResponse) {
                if (error.status === StatusCode.Unauthorized) {
                    errorReference = 'WrongPassword'
                }
            }
            await this.errorService.DisplayError(errorReference)
        }
    }
}
