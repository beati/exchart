package postgres

import "bitbucket.org/beati/budget/budget-server/domain"

// GetRecurringMovement implements domain.CategoryTx.
func (tx Tx) GetRecurringMovement(movementID domain.EntityID) (*domain.RecurringMovement, error) {
	movement := &domain.RecurringMovement{}
	err := tx.sqlTx.Collection("recurring_movements").Find("recurring_movement_id", movementID).One(movement)
	return movement, err
}

// AddRecurringMovement implements domain.CategoryTx.
func (tx Tx) AddRecurringMovement(movement *domain.RecurringMovement) error {
	movementID, err := tx.sqlTx.Collection("recurring_movements").Insert(movement)
	if err != nil {
		return err
	}
	movement.ID = domain.EntityID(movementID.(int64))
	return nil
}

// UpdateRecurringMovement implements domain.CategoryTx.
func (tx Tx) UpdateRecurringMovement(movement *domain.RecurringMovement) error {
	return tx.sqlTx.Collection("recurring_movements").Find("recurring_movement_id", movement.ID).Update(movement)
}

// DeleteRecurringMovement implements domain.CategoryTx.
func (tx Tx) DeleteRecurringMovement(movementID domain.EntityID) error {
	return tx.sqlTx.Collection("recurring_movements").Find("recurring_movement_id", movementID).Delete()
}
