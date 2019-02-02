package domain

// A Category represents a movement category.
type Category struct {
	ID       EntityID `db:"category_id,omitempty"`
	BudgetID EntityID `db:"budget_id"`
	Name     string   `db:"name"`
}

// An CategoryTx interface is used to interact with a persistence solution.
type CategoryTx interface {
	GetCategory(categoryID EntityID) (*Category, error)
	AddCategory(category *Category) error
	UpdateCategory(category *Category) error
	DeleteCategory(categoryID EntityID) error
}

// NewCategory returns a new Category.
func NewCategory(budgetID EntityID, name string) (*Category, error) {
	c := &Category{
		BudgetID: budgetID,
	}
	err := c.SetName(name)
	return c, err
}

// SetName sets the name of c.
func (c *Category) SetName(name string) error {
	if name == "" {
		return ErrBadParameters
	}
	c.Name = name
	return nil
}
