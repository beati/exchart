import { Component, Input, OnInit } from '@angular/core'

import { FlatTreeControl } from '@angular/cdk/tree'
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree'

import { Budget, Category, CategoryType, CategoryTypes } from '../../domain/domain'

import { BudgetService } from '../../services/budget.service'

interface categoryNode {
    category: Category
    form?: {
        submitting: boolean
        error: string
    },
    children?: categoryNode[]
}

interface categoryFlatNode {
    category: Category
    form?: {
        submitting: boolean
        error: string
    },
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
            (node: categoryNode): categoryNode[] | undefined => {
                return node.children
            },
        )

        this.categoriesDataSource = new MatTreeFlatDataSource(this.TreeControl, this.treeFlattener)
    }

    ngOnInit(): void {
        for (let i = 0; i < CategoryTypes.length; i += 1) {
            this.categoryTree.push({
                category: {
                    ID: CategoryTypes[i],
                    Name: CategoryTypes[i],
                    Type: i,
                },
                children: [],
            })
        }

        for (const category of this.Budget.Categories) {
            if (category.Name !== 'default') {
                const children = this.categoryTree[category.Type].children
                if (children != undefined) {
                    children.push({
                        category: category,
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
                    form: {
                        submitting: false,
                        error: '',
                    },
                })
            }
        }

        this.categoriesDataSource.data = this.categoryTree
    }

    private readonly nestedToFlat = (node: categoryNode, level: number): categoryFlatNode => {
        const existingNode = this.nodes.get(node.category.ID)

        if (existingNode != undefined) {
            existingNode.form = node.form
            return existingNode
        }

        const newNode = {
            category: node.category,
            form: node.form,
            expandable: node.children != undefined && node.children.length > 0,
            level: level,
        }

        this.nodes.set(node.category.ID, newNode)

        return newNode
    }

    async AddCategory(type: CategoryType, id: string, name: string): Promise<void> {
        if (name === '') {
            this.setError(type, id, 'Empty')
            return
        }

        try {
            this.setSubmitting(type, id, name)
            const category = await this.budgetService.AddCategory(this.Budget.ID, type, name)
            this.categoryAdded(category)
        } catch (error) {
            this.setError(type, id, 'AlreadyExists')
        }
    }

    private getNode(type: CategoryType, id: string): categoryNode | undefined {
        const topLevelNode = this.categoryTree[type]
        if (topLevelNode.children != undefined) {
            for (const node of topLevelNode.children) {
                if (node.category.ID === id) {
                    return node
                }
            }
        }
    }

    private setError(type: CategoryType, id: string, error: string): void {
        const node = this.getNode(type, id)
        if (node != undefined) {
            if (node.form != undefined) {
                node.form.error = error
            }
        }

        console.log(this.categoryTree)

        this.categoriesDataSource.data = this.categoryTree
    }

    private setSubmitting(type: CategoryType, id: string, name: string): void {
        const node = this.getNode(type, id)
        if (node != undefined) {
            if (node.form != undefined) {
                node.category.Name = name
                node.form.submitting = true
            }
        }

        this.categoriesDataSource.data = this.categoryTree
    }

    private categoryAdded(category: Category): void {
        const topLevelNode = this.categoryTree[category.Type]
        if (topLevelNode.children != undefined) {
            topLevelNode.children.splice(-1, 0, {
                category: category,
            })
            const node = topLevelNode.children[topLevelNode.children.length - 1]
            node.category.Name = ''
            if (node.form != undefined) {
                node.form.submitting = false
                node.form.error = ''
            }
        }
        this.categoriesDataSource.data = this.categoryTree
    }

    EditCategory(): void {
    }

    async UpdateCategory(): Promise<void> {
    }

    async DeleteCategory(): Promise<void> {
    }

    IsTopLevel(_: number, node: categoryFlatNode): boolean {
        return node.expandable
    }

    IsForm(_: number, node: categoryFlatNode): boolean {
        return node.form != undefined
    }
}
