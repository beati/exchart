import { Component, Inject } from '@angular/core'

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

import { Budget } from '../../domain/domain'

@Component({
    selector: 'app-movement-adder-dialog',
    templateUrl: './movement-adder-dialog.component.html',
    styleUrls: ['./movement-adder-dialog.component.scss'],
})
export class MovementAdderDialogComponent {
    constructor(
        private readonly dialogRef: MatDialogRef<MovementAdderDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public Budgets: Budget[],
    ) {}

    Cancel(): void {
        this.dialogRef.close()
    }
}
