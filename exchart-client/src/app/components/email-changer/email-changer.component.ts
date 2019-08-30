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
    selector: 'app-email-changer',
    templateUrl: './email-changer.component.html',
    styleUrls: ['./email-changer.component.scss'],
})
export class EmailChangerComponent {
    Submitting = false
    Password = new FormControl('', [
        Validators.required,
    ])
    Email = new FormControl('', [
        Validators.required,
        Validators.email,
    ])

    constructor(
        private readonly translate: TranslateService,
        private readonly dialog: MatDialog,
        private readonly userService: UserService,
        private readonly errorService: ErrorService,
    ) {}

    async ChangeEmail(): Promise<void> {
        this.Password.updateValueAndValidity()
        this.Email.updateValueAndValidity()

        if (this.Password.hasError('required')) {
            return
        }

        if (this.Email.hasError('required') || this.Email.hasError('email')) {
            return
        }

        try {
            const password = this.Password.value as string
            const email = this.Email.value as string

            this.Submitting = true
            await this.userService.ChangeEmail(password, email)
            this.Submitting = false
            const succesMessage = (await this.translate.get('Settings.ChangeEmail.Success').toPromise()) as string
            this.dialog.open(MessageDialogComponent, {
                autoFocus: false,
                data: succesMessage,
            })
            this.Password.reset()
            this.Password.setErrors(null)
            this.Email.reset()
            this.Email.setErrors(null)
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
