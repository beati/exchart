import { Component, ViewChild } from '@angular/core'

import { MatDialogRef } from '@angular/material/dialog'

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
