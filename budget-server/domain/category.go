package domain

// A Category represents a movement category.
type Category struct {
	ID       EntityID `db:"category_id,omitempty"`
	BudgetID EntityID `db:"budget_id"`
	Name     string   `db:"name"`
}