import { Component } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'

import { TranslateService } from '@ngx-translate/core'

import { MatDialog } from '@angular/material/dialog'

import { BudgetService } from '../../services/budget.service'
import { ErrorService } from '../../services/error.service'

import { MessageDialogComponent } from '../message-dialog/message-dialog.component'

@Component({
    selector: 'app-name-changer',
    templateUrl: './name-changer.component.html',
    styleUrls: ['./name-changer.component.scss'],
})
export class NameChangerComponent {
    Submitting = false
    Name = new FormControl('', [
        Validators.required,
    ])

    constructor(
        private readonly translate: TranslateService,
        private readonly dialog: MatDialog,
        private readonly budgetService: BudgetService,
        private readonly errorService: ErrorService,
    ) {}

    async ChangeName(): Promise<void> {
        this.Name.updateValueAndValidity()
        if (this.Name.hasError('required')) {
            return
        }

        try {
            const name = this.Name.value as string

            this.Submitting = true
            await this.budgetService.UpdateAcount(name)
            this.Submitting = false
            const succesMessage = (await this.translate.get('Settings.ChangeName.Success').toPromise()) as string
            this.dialog.open(MessageDialogComponent, {
                autoFocus: false,
                data: succesMessage,
            })
            this.Name.reset('')
            this.Name.setErrors(null)
        } catch (error) {
            this.Submitting = false
            this.errorService.DisplayError()
        }
    }
}
