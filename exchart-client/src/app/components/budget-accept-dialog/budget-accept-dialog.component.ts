import { Component, Inject } from '@angular/core'

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

@Component({
    selector: 'app-budget-accept-dialog',
    templateUrl: './budget-accept-dialog.component.html',
    styleUrls: ['./budget-accept-dialog.component.scss'],
})
export class BudgetAcceptDialogComponent {
    constructor(
        private readonly dialogRef: MatDialogRef<BudgetAcceptDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public With: string,
    ) {}

    Refuse(): void {
        this.dialogRef.close(false)
    }

    Accept(): void {
        this.dialogRef.close(true)
    }
}
