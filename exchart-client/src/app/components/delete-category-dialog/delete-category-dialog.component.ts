import { Component, Inject } from '@angular/core'

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

import { Category } from '../../domain/domain'

@Component({
    selector: 'app-delete-category-dialog',
    templateUrl: './delete-category-dialog.component.html',
    styleUrls: ['./delete-category-dialog.component.scss'],
})
export class DeleteCategoryDialogComponent {
    constructor(
        private readonly dialogRef: MatDialogRef<DeleteCategoryDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public Data: Category,
    ) {}

    Cancel(): void {
        this.dialogRef.close(false)
    }

    Delete(): void {
        this.dialogRef.close(true)
    }
}
