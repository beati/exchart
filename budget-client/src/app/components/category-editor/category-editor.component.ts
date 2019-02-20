import { Component, Input, OnInit } from '@angular/core'

import { FlatTreeControl } from '@angular/cdk/tree'
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree'

import { Budget, Category, CategoryType, CategoryTypes } from '../../domain/domain'

import { BudgetService } from '../../services/budget.service'

interface categoryNode {
    category: Category
    children?: categoryNode[]
}

interface categoryFlatNode {
    category: Category
    expandable: boolean
    level: number
}

@Component({
    selector: 'app-category-editor',
    templateUrl: './category-editor.component.html',
    styleUrls: ['./category-editor.component.scss'],
})
export class CategoryEditorComponent implements OnInit {
    @Input() Budget: Budget

    categoryTree: categoryNode[] = []

    TreeControl = new FlatTreeControl<categoryFlatNode>(
        (node: categoryFlatNode): number => {
            return node.level
        },
        (node: categoryFlatNode): boolean => {
            return node.expandable
        },
    )

    treeFlattener = new MatTreeFlattener(
        this.nestedToFlat, 
        (node: categoryFlatNode): number => {
            return node.level
        },
        (node: categoryFlatNode): boolean => {
            return node.expandable
        },
        (node: categoryNode) => {
            return node.children
        }
    )

    categoriesDataSource = new MatTreeFlatDataSource(this.TreeControl, this.treeFlattener)

    constructor(
        private readonly budgetService: BudgetService,
    ) {}

    ngOnInit(): void {
        for (let i = 0; i < CategoryTypes.length; i++) {
            this.categoryTree.push({
                category: {
                    ID: '',
                    Name: CategoryTypes[i],
                    Type: i,
                },
                children: [],
            })
        }

        for (let i = 0; i < this.Budget.Categories.length; i++) {
            const category = this.Budget.Categories[i]
            if (category.Name != 'default') {
                const children = this.categoryTree[category.Type].children
                if (children != undefined) {
                    children.push({
                        category: category,
                    })
                }
            }
        }

        for (let i = 0; i < this.categoryTree.length; i++) {
            let topLevelNode = this.categoryTree[i]
            if (topLevelNode.children != undefined) {
                topLevelNode.children.push({
                    category : {
                        ID: '',
                        Name: '',
                        Type: i,
                    },
                })
            }
        }

        this.categoriesDataSource.data = this.categoryTree
    }

    private nestedToFlat(node: categoryNode, level: number): categoryFlatNode {
        return {
            category: node.category,
            expandable: node.children != undefined && node.children.length > 0,
            level: level,
        }
    }

    async AddCategory(type: CategoryType, name: string): Promise<void> {
        try {
            this.setSubmitting(type, name)
            const category = await this.budgetService.AddCategory(this.Budget.ID, type, name)
            this.categoryAdded(category)
        } catch (error) {
        }
    }

    private setSubmitting(type: CategoryType, name: string): void {
        let topLevelNode = this.categoryTree[type]
        if (topLevelNode.children != undefined) {
            const node = topLevelNode.children[topLevelNode.children.length-1]
            node.category.Name = name
            node.category.ID = 'submitting'
        }
        this.categoriesDataSource.data = this.categoryTree
    }

    private categoryAdded(category: Category): void {
        let topLevelNode = this.categoryTree[category.Type]
        if (topLevelNode.children != undefined) {
            topLevelNode.children.splice(-1, 0, {
                category: category,
            })
            const node = topLevelNode.children[topLevelNode.children.length-1]
            node.category.Name = ''
            node.category.ID = ''
        }
        this.categoriesDataSource.data = this.categoryTree
    }

    async DeleteCategory(): Promise<void> {
    }

    IsTopLevel(_: number, node: categoryFlatNode): boolean {
        return node.expandable
    }

    IsEmpty(_: number, node: categoryFlatNode): boolean {
        return node.category.Name === ''
    }
}
