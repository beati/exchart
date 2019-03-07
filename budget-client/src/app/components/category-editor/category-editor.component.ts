import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms'

import { Subscription } from 'rxjs'

import { FlatTreeControl } from '@angular/cdk/tree'
import { MatDialog } from '@angular/material/dialog'
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree'

import { Budget, Category, CategoryType, CategoryTypes } from '../../domain/domain'

import { DataflowService } from '../../services/dataflow.service'
import { ErrorService } from '../../services/error.service'

import { DeleteCategoryDialogComponent } from '../delete-category-dialog/delete-category-dialog.component'

interface categoryForm {
    update: boolean
    formControl: FormControl
}

interface categoryNode {
    category: Category
    submitting: boolean
    form?: categoryForm
    children?: categoryNode[]
}

interface categoryFlatNode {
    category: Category
    submitting: boolean
    form?: categoryForm
    expandable: boolean
    level: number
}

@Component({
    selector: 'app-category-editor',
    templateUrl: './category-editor.component.html',
    styleUrls: ['./category-editor.component.scss'],
})
export class CategoryEditorComponent implements OnInit, OnDestroy {
    private budgetID: string
    private budgetSub: Subscription

    categoryTree: categoryNode[]
    nodes: Map<string, categoryFlatNode>

    TreeControl: FlatTreeControl<categoryFlatNode>
    treeFlattener: MatTreeFlattener<categoryNode, categoryFlatNode>
    categoriesDataSource: MatTreeFlatDataSource<categoryNode, categoryFlatNode>

    constructor(
        private readonly dialog: MatDialog,
        private readonly dataflowService: DataflowService,
        private readonly errorService: ErrorService,
    ) {}

    ngOnInit(): void {
        const budget = this.dataflowService.SelectedBudget.value
        this.budgetID = budget.ID
        this.init(budget)

        this.budgetSub = this.dataflowService.SelectedBudget.subscribe((budget) => {
            if (budget.ID === this.budgetID) {
                return
            }

            this.budgetID = budget.ID
            this.init(budget)
        })
    }

    ngOnDestroy(): void {
        this.budgetSub.unsubscribe()
    }

    private init(budget: Budget): void {
        this.categoryTree = []
        this.nodes = new Map<string, categoryFlatNode>()

        this.TreeControl = new FlatTreeControl<categoryFlatNode>(
            (node: categoryFlatNode): number => {
                return node.level
            },
            (node: categoryFlatNode): boolean => {
                return node.expandable
            },
        )

        this.treeFlattener = new MatTreeFlattener(
            this.nestedToFlat,
            (node: categoryFlatNode): number => {
                return node.level
            },
            (node: categoryFlatNode): boolean => {
                return node.expandable
            },
            (node: categoryNode): categoryNode[] | undefined => {
                return node.children
            },
        )

        this.categoriesDataSource = new MatTreeFlatDataSource(this.TreeControl, this.treeFlattener)

        for (let i = 0; i < CategoryTypes.length; i += 1) {
            this.categoryTree.push({
                category: {
                    ID: CategoryTypes[i],
                    Name: CategoryTypes[i],
                    Type: i,
                },
                submitting: false,
                children: [],
            })
        }

        for (const category of budget.Categories) {
            if (category.Name !== 'default') {
                const children = this.categoryTree[category.Type].children
                if (children != undefined) {
                    children.push({
                        category: category,
                        submitting: false,
                    })
                }
            }
        }

        for (let i = 0; i < this.categoryTree.length; i += 1) {
            const topLevelNode = this.categoryTree[i]
            if (topLevelNode.children != undefined) {
                topLevelNode.children.push({
                    category : {
                        ID: `${i}`,
                        Name: '',
                        Type: i,
                    },
                    submitting: false,
                    form: {
                        update: false,
                        formControl: new FormControl('', [
                            Validators.required,
                            this.alreadyExistsValidator(i),
                        ]),
                    },
                })
            }
        }

        this.categoriesDataSource.data = this.categoryTree
    }

    private readonly nestedToFlat = (node: categoryNode, level: number): categoryFlatNode => {
        const existingNode = this.nodes.get(node.category.ID)

        if (existingNode != undefined) {
            existingNode.submitting = node.submitting
            existingNode.form = node.form
            return existingNode
        }

        const newNode = {
            category: node.category,
            submitting: node.submitting,
            form: node.form,
            expandable: node.children != undefined && node.children.length > 0,
            level: level,
        }

        this.nodes.set(node.category.ID, newNode)

        return newNode
    }

    private alreadyExistsValidator(type: CategoryType): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const name = control.value

            if (typeof name === 'string') {
                const topLevelNode = this.categoryTree[type]
                if (topLevelNode.children == undefined) {
                    return null
                }

                for (const node of topLevelNode.children) {
                    if (node.form == undefined && node.category.Name === name) {
                        return {
                            'alreadyExists': {
                                value: control.value,
                            },
                        }
                    }
                }
            }

            return null
        }
    }

    async AddCategory(type: CategoryType, id: string, name: string): Promise<void> {
        if (this.hasError(type, id)) {
            return
        }

        try {
            this.setSubmitting(type, id, name, true)
            const category = await this.dataflowService.AddCategory(this.budgetID, type, name)
            this.categoryAdded(category)
        } catch (error) {
            this.setSubmitting(type, id, name, false)
            await this.errorService.DisplayError()
        }
    }

    EditCategory(type: CategoryType, id: string): void {
        const node = this.getNode(type, id)
        if (node == undefined) {
            return
        }

        node.form = {
            update: true,
            formControl: new FormControl(node.category.Name, [
                Validators.required,
                this.alreadyExistsValidator(type),
            ]),
        }

        this.categoriesDataSource.data = this.categoryTree
    }

    CancelCategoryEdition(type: CategoryType, id: string): void {
        const node = this.getNode(type, id)
        if (node == undefined) {
            return
        }

        node.submitting = false
        node.form = undefined

        this.categoriesDataSource.data = this.categoryTree
    }

    async UpdateCategory(type: CategoryType, id: string, name: string): Promise<void> {
        if (this.hasError(type, id)) {
            return
        }

        try {
            this.setSubmitting(type, id, name, true)
            await this.dataflowService.UpdateCategory(id, name)
            this.CancelCategoryEdition(type, id)
        } catch (error) {
            this.setSubmitting(type, id, name, false)
            await this.errorService.DisplayError()
        }
    }

    async DeleteCategory(type: CategoryType, id: string): Promise<void> {
        const node = this.getNode(type, id)
        if (node == undefined) {
            return
        }

        const dialogRef = this.dialog.open(DeleteCategoryDialogComponent, {
            data: node.category,
        })

        const deleteAccepted = await dialogRef.afterClosed().toPromise()

        if (typeof deleteAccepted === 'boolean' && deleteAccepted) {
            try {
                this.setSubmitting(type, id, node.category.Name, true)
                await this.dataflowService.DeleteCategory(id)
                this.categoryDeleted(type, id)
            } catch (error) {
                this.setSubmitting(type, id, node.category.Name, false)
                await this.errorService.DisplayError()
            }
        }
    }

    private getNode(type: CategoryType, id: string): categoryNode | undefined {
        const topLevelNode = this.categoryTree[type]
        if (topLevelNode.children == undefined) {
            return undefined
        }

        for (const node of topLevelNode.children) {
            if (node.category.ID === id) {
                return node
            }
        }
        return undefined
    }

    private hasError(type: CategoryType, id: string): boolean {
        const node = this.getNode(type, id)
        if (node == undefined) {
            return false
        }

        if (node.form == undefined) {
            return false
        }

        if (node.form.formControl.hasError('required') || node.form.formControl.hasError('alreadyExists')) {
            return true
        }
        return false
    }

    private setSubmitting(type: CategoryType, id: string, name: string, submitting: boolean): void {
        const node = this.getNode(type, id)
        if (node == undefined) {
            return
        }

        node.category.Name = name
        node.submitting = submitting

        this.categoriesDataSource.data = this.categoryTree
    }

    private categoryAdded(category: Category): void {
        const topLevelNode = this.categoryTree[category.Type]
        if (topLevelNode.children == undefined) {
            return
        }

        topLevelNode.children.splice(-1, 0, {
            category: category,
            submitting: false,
        })
        const node = topLevelNode.children[topLevelNode.children.length - 1]
        node.category.Name = ''
        node.submitting = false
        if (node.form != undefined) {
            node.form.formControl.reset('')
        }

        this.categoriesDataSource.data = this.categoryTree
    }

    private categoryDeleted(type: CategoryType, id: string): void {
        const topLevelNode = this.categoryTree[type]
        if (topLevelNode.children == undefined) {
            return
        }

        for (let i = 0; i < topLevelNode.children.length; i += 1) {
            const node = topLevelNode.children[i]
            if (node.category.ID === id) {
                topLevelNode.children.splice(i, 1)
            }
        }

        this.nodes.delete(id)

        this.categoriesDataSource.data = this.categoryTree
    }

    IsTopLevel(_: number, node: categoryFlatNode): boolean {
        return node.expandable
    }

    IsAdder(_: number, node: categoryFlatNode): boolean {
        return node.form != undefined && !node.form.update
    }
}
