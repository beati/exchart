import { Component, Input, OnInit } from '@angular/core'

import { FlatTreeControl } from '@angular/cdk/tree'
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree'

import { Budget, Category, CategoryType, CategoryTypes } from '../../domain/domain'

import { BudgetService } from '../../services/budget.service'

interface categoryNode {
    category: Category
    submitting: boolean
    children?: categoryNode[]
}

interface categoryFlatNode {
    category: Category
    submitting: boolean
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
    nodes = new Map<string, categoryFlatNode>()

    TreeControl: FlatTreeControl<categoryFlatNode>
    treeFlattener: MatTreeFlattener<categoryNode, categoryFlatNode>
    categoriesDataSource: MatTreeFlatDataSource<categoryNode, categoryFlatNode>

    constructor(
        private readonly budgetService: BudgetService,
    ) {
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
            (node: categoryNode) => {
                return node.children
            }
        )

        this.categoriesDataSource = new MatTreeFlatDataSource(this.TreeControl, this.treeFlattener)
    }

    ngOnInit(): void {
        for (let i = 0; i < CategoryTypes.length; i++) {
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

        for (let i = 0; i < this.Budget.Categories.length; i++) {
            const category = this.Budget.Categories[i]
            if (category.Name != 'default') {
                const children = this.categoryTree[category.Type].children
                if (children != undefined) {
                    children.push({
                        category: category,
                        submitting: false,
                    })
                }
            }
        }

        for (let i = 0; i < this.categoryTree.length; i++) {
            let topLevelNode = this.categoryTree[i]
            if (topLevelNode.children != undefined) {
                topLevelNode.children.push({
                    category : {
                        ID: `${i}`,
                        Name: '',
                        Type: i,
                    },
                    submitting: false,
                })
            }
        }

        this.categoriesDataSource.data = this.categoryTree
    }

    private nestedToFlat = (node: categoryNode, level: number): categoryFlatNode => {
        const existingNode = this.nodes.get(node.category.ID)

        if (existingNode != undefined) {
            existingNode.submitting = node.submitting
            return existingNode
        }

        const newNode = {
            category: node.category,
            submitting: node.submitting,
            expandable: node.children != undefined && node.children.length > 0,
            level: level,
        }

        this.nodes.set(node.category.ID, newNode)

        return newNode
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
            node.submitting = true
        }
        this.categoriesDataSource.data = this.categoryTree
    }

    private categoryAdded(category: Category): void {
        let topLevelNode = this.categoryTree[category.Type]
        if (topLevelNode.children != undefined) {
            topLevelNode.children.splice(-1, 0, {
                category: category,
                submitting: false,
            })
            const node = topLevelNode.children[topLevelNode.children.length-1]
            node.category.Name = ''
            node.submitting = false
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
