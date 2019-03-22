import { Component, Inject } from '@angular/core'

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

import { Budget } from '../../domain/domain'

@Component({
    selector: 'app-delete-budget-dialog',
    templateUrl: './delete-budget-dialog.component.html',
    styleUrls: ['./delete-budget-dialog.component.scss'],
})
export class DeleteBudgetDialogComponent {
    constructor(
        private readonly dialogRef: MatDialogRef<DeleteBudgetDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public Budget: Budget,
    ) {}

    Cancel(): void {
        this.dialogRef.close(false)
    }

    Delete(): void {
        this.dialogRef.close(true)
    }
}
