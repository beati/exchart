package domain

type Category struct {
	CategoryID EntityID `db:"category_id"`
	BudgetID   EntityID `db:"budget_id"`
	Name       string   `db:"name"`
}
