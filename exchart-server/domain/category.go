package domain

// A CategoryType represents a type of category.
type CategoryType int

// Possible values for a CategoryType.
const (
	Income  CategoryType = -1
	Housing CategoryType = iota
	Transport
	DailyLife
	Healthcare
	Leisure
	CategoryTypeCount
)

// A Category represents a movement category.
type Category struct {
	ID       EntityID     `db:"category_id,omitempty"`
	BudgetID EntityID     `db:"budget_id" json:"-"`
	Type     CategoryType `db:"type"`
	Name     string       `db:"name"`
}

// An CategoryTx interface is used to interact with a persistence solution.
type CategoryTx interface {
	GetCategories(budgetID EntityID) ([]Category, error)
	GetCategory(categoryID EntityID) (*Category, error)
	AddCategory(category *Category) error
	UpdateCategory(category *Category) error
	DeleteCategory(categoryID EntityID) error
}

// NewCategory returns a new Category.
func NewCategory(budgetID EntityID, categoryType CategoryType, name string) (*Category, error) {
	if !(0 <= categoryType || categoryType < CategoryTypeCount) {
		return nil, ErrBadParameters
	}

	c := &Category{
		BudgetID: budgetID,
		Type:     categoryType,
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
