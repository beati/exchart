package domain

import "errors"

// A CategoryType represents a type of category.
type CategoryType int

// Possible values for a CategoryType.
const (
	Transport CategoryType = iota
	House
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

const defaultName = "default"

// NewDefaultCategory returns a new Category.
func NewDefaultCategory(budgetID EntityID, categoryType CategoryType) (*Category, error) {
	if !(0 <= categoryType || categoryType < CategoryTypeCount) {
		return nil, errors.New("invalid category type")
	}

	return &Category{
		BudgetID: budgetID,
		Type:     categoryType,
		Name:     defaultName,
	}, nil
}

// IsDeletable returns nil if c can be deleted.
func (c *Category) IsDeletable() error {
	if c.Name == defaultName {
		return ErrBadParameters
	}
	return nil
}

// SetName sets the name of c.
func (c *Category) SetName(name string) error {
	if name == "" || name == defaultName {
		return ErrBadParameters
	}
	c.Name = name
	return nil
}
