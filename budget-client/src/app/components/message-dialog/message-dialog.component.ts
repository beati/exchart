import { Component, Inject } from '@angular/core'

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

@Component({
    selector: 'app-message-dialog',
    templateUrl: './message-dialog.component.html',
    styleUrls: ['./message-dialog.component.scss'],
})
export class MessageDialogComponent {
    constructor(
        private readonly dialogRef: MatDialogRef<MessageDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public Message: string,
    ) {}

    Close(): void {
        this.dialogRef.close(false)
    }
}
