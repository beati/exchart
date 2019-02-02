package postgres

import (
	"fmt"

	"github.com/lib/pq"

	"bitbucket.org/beati/budget/budget-server/domain"
)

// GetCategory implements domain.CategoryTx.
func (tx Tx) GetCategory(categoryID domain.EntityID) (*domain.Category, error) {
	category := &domain.Category{}
	err := tx.sqlTx.Collection("categories").Find("category_id", categoryID).One(category)
	return category, err
}

// AddCategory implements domain.CategoryTx.
func (tx Tx) AddCategory(category *domain.Category) error {
	categoryID, err := tx.sqlTx.Collection("categories").Insert(category)
	if err, ok := err.(*pq.Error); ok {
		if err.Code == pqErrorUniqueViolation {
			return domain.ErrBadParameters
		}
	}
	if err != nil {
		return err
	}
	category.ID = domain.EntityID(categoryID.(int64))
	return nil
}

// UpdateCategory implements domain.CategoryTx.
func (tx Tx) UpdateCategory(category *domain.Category) error {
	return tx.sqlTx.Collection("categories").Find("category_id", category.ID).Update(category)
}

// DeleteCategory implements domain.CategoryTx.
func (tx Tx) DeleteCategory(categoryID domain.EntityID) error {
	err := tx.sqlTx.Collection("categories").Find("category_id", categoryID).Delete()
	if err, ok := err.(*pq.Error); ok {
		fmt.Println(err.Code)
		if err.Code == pqErrorRestrictViolation {
			return domain.ErrBadParameters
		}
	}
	return err
}
