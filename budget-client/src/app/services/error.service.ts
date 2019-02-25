import { Injectable } from '@angular/core'

import { MatSnackBar } from '@angular/material/snack-bar'

import { TranslateService } from '@ngx-translate/core'

@Injectable({
    providedIn: 'root',
})
export class ErrorService {
    constructor(
        private readonly snackBar: MatSnackBar,
        private readonly translate: TranslateService,
    ) {}

    async DisplayError(): Promise<void> {
        const message = await this.translate.get('Error').toPromise()
        if (typeof message !== 'string') {
            return
        }
        this.snackBar.open(message, 'Ok', { duration: 3000 })
    }
}
