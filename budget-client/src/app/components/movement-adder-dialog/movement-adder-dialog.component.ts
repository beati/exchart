import { Component, Inject, ViewChild } from '@angular/core'

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

import { Budget } from '../../domain/domain'

import { MovementAdderComponent } from '../movement-adder/movement-adder.component'

@Component({
    selector: 'app-movement-adder-dialog',
    templateUrl: './movement-adder-dialog.component.html',
    styleUrls: ['./movement-adder-dialog.component.scss'],
})
export class MovementAdderDialogComponent {
    @ViewChild('movementAdder') MovementAdder: MovementAdderComponent

    Submitting = false

    constructor(
        private readonly dialogRef: MatDialogRef<MovementAdderDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public Budgets: Budget[],
    ) {}

    Cancel(): void {
        this.dialogRef.close()
    }

    async AddMovement(): Promise<void> {
        this.Submitting = true
        const success = await this.MovementAdder.AddMovement()
        this.Submitting = false
        if (success) {
            this.dialogRef.close()
        }
    }
}
